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

const CONTENT_CATEGORIES = [
  'Beauty/Skincare', 'Makeup', 'Fashion', 'Lifestyle',
  'Educational', 'Reviews/Recommendations', 'Others',
]

const COLLAB_PREFERENCES = [
  'Gifted products', 'Affiliated/commission-based',
  'Long-term partnership', 'Paid campaign',
]

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
  if (!followerCount || !FOLLOWER_RANGES[followerCount])
    return fail(`followerCount must be one of: ${Object.keys(FOLLOWER_RANGES).join(', ')}`)
  if (liveExperience !== 'Yes' && liveExperience !== 'No')
    return fail('liveExperience must be "Yes" or "No"')

  // primaryContentCategory — accept single string or array, at least one required
  const categories = Array.isArray(primaryContentCategory)
    ? primaryContentCategory
    : primaryContentCategory ? [primaryContentCategory] : []
  const invalidCats = categories.filter(c => !CONTENT_CATEGORIES.includes(c))
  if (categories.length === 0)
    return fail('at least one primaryContentCategory is required')
  if (invalidCats.length)
    return fail(`invalid category: ${invalidCats.join(', ')}. Valid: ${CONTENT_CATEGORIES.join(', ')}`)

  // collaborationPreference — accept single string or array, at least one required
  const collabPrefs = Array.isArray(collaborationPreference)
    ? collaborationPreference
    : collaborationPreference ? [collaborationPreference] : []
  const invalidPrefs = collabPrefs.filter(p => !COLLAB_PREFERENCES.includes(p))
  if (collabPrefs.length === 0)
    return fail('at least one collaborationPreference is required')
  if (invalidPrefs.length)
    return fail(`invalid preference: ${invalidPrefs.join(', ')}. Valid: ${COLLAB_PREFERENCES.join(', ')}`)

  // Both consents must be explicitly true
  if (consent1 !== true)
    return fail('consent1 is required')
  if (consent2 !== true)
    return fail('consent2 is required')

  const recruit = {
    id:               randomId(),
    initials:         getInitials(name),
    name:             name.trim(),
    platform:         'TikTok',
    followers:        FOLLOWER_RANGES[followerCount],
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
    contactNumber:    contactNumber.trim(),
    tiktokUsername:   normaliseUsername(tiktokUsername),
    followerRange:    followerCount,
    liveExperience:   liveExperience,
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
