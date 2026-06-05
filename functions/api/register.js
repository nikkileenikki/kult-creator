import { getDB } from './_helpers'
import { recruitQ } from './_queries'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const opts = () => new Response(null, { status: 204, headers: CORS })
const pub  = (data, status = 200) => Response.json(data, { status, headers: CORS })
const fail = (msg, status = 400)  => Response.json({ error: msg }, { status, headers: CORS })

const FOLLOWER_RANGES = {
  'under 10k':    5_000,
  '10k-50k':     25_000,
  '50k-100k':    75_000,
  '100k-500k':  250_000,
  '500k+':      500_000,
}

const CATEGORY_MAP = {
  beauty:      'Beauty/Skincare',
  makeup:      'Makeup',
  fashion:     'Fashion',
  lifestyle:   'Lifestyle',
  educational: 'Educational',
  reviews:     'Reviews/Recommendations',
  others:      'Others',
}

const COLLAB_MAP = {
  gifted:    'Gifted Products',
  affiliate: 'Affiliate/commission-based',
  longterm:  'Long-term partnerships',
  paid:      'Paid Campaigns',
}

function resolveSlug(val, map) {
  const key = val?.toString().trim().toLowerCase()
  return map[key] ?? null
}

const AVATAR_COLORS = [
  '#6C5CE7','#0891B2','#D97706','#059669','#DC2626',
  '#7C3AED','#DB2777','#EA580C','#0284C7','#65A30D',
]

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('').slice(0, 2)
}

function randomId() {
  return `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

function normaliseUsername(val) {
  if (!val) return ''
  return val.trim().startsWith('@') ? val.trim() : `@${val.trim()}`
}

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return fail('Service unavailable', 503)

  let body
  try { body = await request.json() } catch { return fail('Invalid JSON') }

  const {
    name,
    email,
    contactNumber     = '',
    tiktokUsername    = '',
    videoLink         = '',
    followerCount,
    liveExperience,
    primaryContentCategory,
    collaborationPreference,
    consent1,
    consent2,
    website,          // honeypot — must be empty
  } = body ?? {}

  // ── Honeypot check — bots fill hidden fields, humans don't ────────────────
  if (website) return pub({ success: true, message: 'Application received.' }, 201)

  // ── Required field validation ──────────────────────────────────────────────
  if (!name?.trim())
    return fail('name is required')
  if (!email?.trim())
    return fail('email is required')

  // followerCount: normalise casing, K→k, en/em dash → hyphen, collapse spaces
  const followerKey = followerCount?.toString().trim()
    .toLowerCase()
    .replace(/\s*[–—]+\s*/g, '-')  // en/em dash with surrounding spaces → hyphen
    .replace(/\s+/g, ' ')          // collapse internal spaces
    .trim()
  if (!followerKey || !FOLLOWER_RANGES[followerKey])
    return fail(`followerCount must be one of: ${Object.keys(FOLLOWER_RANGES).join(', ')}. Received: "${followerCount}"`)


  // liveExperience: trim + normalise case
  const liveExp = liveExperience?.toString().trim()
  const liveExpNorm = liveExp === 'yes' ? 'Yes' : liveExp === 'no' ? 'No' : liveExp
  if (liveExpNorm !== 'Yes' && liveExpNorm !== 'No')
    return fail('liveExperience must be "Yes" or "No"')

  // primaryContentCategory — accept single slug or array of slugs
  const rawCats = (Array.isArray(primaryContentCategory)
    ? primaryContentCategory
    : primaryContentCategory ? [primaryContentCategory] : []
  ).map(c => c?.toString().trim()).filter(Boolean)
  const categories = rawCats.map(c => resolveSlug(c, CATEGORY_MAP)).filter(Boolean)
  const invalidCats = rawCats.filter(c => !resolveSlug(c, CATEGORY_MAP))
  if (rawCats.length === 0)
    return fail(`at least one primaryContentCategory is required. Valid slugs: ${Object.keys(CATEGORY_MAP).join(', ')}`)
  if (invalidCats.length)
    return fail(`invalid category slug: ${invalidCats.join(', ')}. Valid: ${Object.keys(CATEGORY_MAP).join(', ')}`)

  // collaborationPreference — accept single slug or array of slugs
  const rawPrefs = (Array.isArray(collaborationPreference)
    ? collaborationPreference
    : collaborationPreference ? [collaborationPreference] : []
  ).map(p => p?.toString().trim()).filter(Boolean)
  const collabPrefs = rawPrefs.map(p => resolveSlug(p, COLLAB_MAP)).filter(Boolean)
  const invalidPrefs = rawPrefs.filter(p => !resolveSlug(p, COLLAB_MAP))
  if (rawPrefs.length === 0)
    return fail(`at least one collaborationPreference is required. Valid slugs: ${Object.keys(COLLAB_MAP).join(', ')}`)
  if (invalidPrefs.length)
    return fail(`invalid preference slug: ${invalidPrefs.join(', ')}. Valid: ${Object.keys(COLLAB_MAP).join(', ')}`)

  // Consents — accept boolean true, string "true", or number 1
  const isTruthy = v => v === true || v === 'true' || v === 1 || v === '1'
  if (!isTruthy(consent1))
    return fail('consent1 is required')
  if (!isTruthy(consent2))
    return fail('consent2 is required')

  const recruit = {
    id:               randomId(),
    initials:         getInitials(name),
    name:             name.trim(),
    platform:         'TikTok',
    followers:        FOLLOWER_RANGES[followerKey],
    engagementRate:   0,
    niche:            categories.join(', '),
    tags:             categories,
    appliedDate:      new Date().toISOString().split('T')[0],
    source:           'Registration Form',
    pic:              'Unassigned',
    description:      '',
    status:           'Pending',
    avatarColor:      randomColor(),
    email:            email.trim(),
    contactNumber:    contactNumber?.toString().trim() ?? '',
    tiktokUsername:   normaliseUsername(tiktokUsername),
    followerRange:    followerKey,
    liveExperience:   liveExpNorm,
    collabPreference: collabPrefs,
    videoLink:        videoLink.trim(),
  }

  try {
    await recruitQ.create(db, recruit)
  } catch (e) {
    if (e.message?.includes('no such table'))
      return fail('Database not initialised — visit /api/setup', 503)
    return fail('Database error: ' + e.message, 500)
  }

  return pub(
    { success: true, id: recruit.id, message: 'Application received. We will review it shortly.' },
    201,
  )
}
