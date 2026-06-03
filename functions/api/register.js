import { json, err, getDB } from './_helpers'
import { recruitQ } from './_queries'

// Public CORS — allow any origin since this is an embeddable registration form
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const opts = () => new Response(null, { status: 204, headers: CORS })
const pub  = (data, status = 200) => Response.json(data, { status, headers: CORS })
const fail = (msg, status = 400)  => Response.json({ error: msg }, { status, headers: CORS })

const AVATAR_COLORS = [
  '#6C5CE7','#0891B2','#D97706','#059669','#DC2626',
  '#7C3AED','#DB2777','#EA580C','#0284C7','#65A30D',
]

const PLATFORMS = ['Instagram','TikTok','YouTube','Twitter/X','Facebook','Pinterest','LinkedIn']

function getInitials(name) {
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join('').slice(0, 2)
}

function randomId() {
  return `reg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return fail('Service unavailable', 503)

  let body
  try { body = await request.json() } catch { return fail('Invalid JSON') }

  const {
    name,
    platform,
    platformUsername = '',
    followers,
    engagementRate,
    niche,
    tags,
    description = '',
    email = '',
  } = body ?? {}

  // Required field validation
  if (!name?.trim())             return fail('name is required')
  if (!platform?.trim())         return fail('platform is required')
  if (!PLATFORMS.includes(platform)) return fail(`platform must be one of: ${PLATFORMS.join(', ')}`)
  if (followers == null || isNaN(Number(followers)) || Number(followers) < 0)
    return fail('followers must be a non-negative number')
  if (!niche?.trim())            return fail('niche is required')

  // Normalise tags — accept array or comma-separated string
  let tagList = []
  if (Array.isArray(tags))       tagList = tags.map(t => String(t).trim()).filter(Boolean)
  else if (typeof tags === 'string') tagList = tags.split(',').map(t => t.trim()).filter(Boolean)

  // Build description — append email if provided so it's visible in the dashboard
  const descParts = []
  if (description?.trim()) descParts.push(description.trim())
  if (email?.trim())        descParts.push(`Contact: ${email.trim()}`)
  if (platformUsername?.trim()) descParts.push(`@${platformUsername.trim()} on ${platform}`)

  const recruit = {
    id:             randomId(),
    initials:       getInitials(name),
    name:           name.trim(),
    platform,
    followers:      Number(followers),
    engagementRate: engagementRate != null ? Number(engagementRate) : 0,
    niche:          niche.trim(),
    tags:           tagList,
    appliedDate:    new Date().toISOString().split('T')[0],
    source:         'Registration Form',
    pic:            'Unassigned',
    description:    descParts.join(' · '),
    status:         'Pending',
    avatarColor:    randomColor(),
  }

  try {
    await recruitQ.create(db, recruit)
  } catch (e) {
    if (e.message?.includes('no such table')) return fail('Database not initialised — visit /api/setup', 503)
    return fail('Database error: ' + e.message, 500)
  }

  return pub({ success: true, id: recruit.id, message: 'Application received. We will review it shortly.' }, 201)
}
