const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export const json  = (data, status = 200)  => Response.json(data, { status, headers: CORS })
export const err   = (msg, status = 400)   => Response.json({ error: msg }, { status, headers: CORS })
export const opts  = ()                    => new Response(null, { status: 204, headers: CORS })
export const getDB = (env)                 => env.DB ?? null

function tryParse(str, fallback) {
  try { return JSON.parse(str) } catch { return fallback }
}

export function mapCreator(row) {
  if (!row) return null
  return {
    id:               row.id,
    initials:         row.initials,
    name:             row.name,
    platform:         row.platform,
    niche:            row.niche,
    secondaryNiche:   row.secondary_niche   ?? '',
    followers:        row.followers,
    coins:            row.coins,
    tasksCompleted:   row.tasks_completed,
    status:           row.status,
    pic:              row.pic,
    contact:          row.contact,
    joinedDate:       row.joined_date,
    avatarColor:      row.avatar_color,
    persona:          tryParse(row.persona, {}),
    contactNumber:    row.contact_number    ?? '',
    email:            row.email             ?? '',
    platformUsername: row.platform_username ?? '',
    dateOfBirth:      row.date_of_birth     ?? '',
  }
}

export function mapTask(row) {
  if (!row) return null
  return {
    id:          row.id,
    creatorId:   row.creator_id,
    creatorName: row.creator_name,
    platform:    row.platform,
    task:        row.task,
    project:     row.project,
    status:      row.status,
    priority:    row.priority,
    pic:         row.pic,
    dueDate:     row.due_date,
    coins:       row.coins,
    notes:       row.notes  ?? '',
    rating:      row.rating ?? 0,
    review:      row.review ?? '',
  }
}

export function mapRecruit(row) {
  if (!row) return null
  return {
    id:                row.id,
    initials:          row.initials,
    name:              row.name,
    platform:          row.platform,
    followers:         row.followers,
    engagementRate:    row.engagement_rate,
    niche:             row.niche,
    tags:              tryParse(row.tags, []),
    appliedDate:       row.applied_date,
    source:            row.source,
    pic:               row.pic,
    description:       row.description,
    status:            row.status,
    avatarColor:       row.avatar_color,
    email:             row.email             ?? '',
    contactNumber:     row.contact_number    ?? '',
    tiktokUsername:    row.tiktok_username   ?? '',
    followerRange:     row.follower_range    ?? '',
    liveExperience:    row.live_experience   ?? '',
    collabPreference:  tryParse(row.collab_preference, []),
    videoLink:         row.video_link ?? '',
  }
}

export function mapCampaign(row) {
  if (!row) return null
  return {
    id:          row.id,
    name:        row.name,
    description: row.description ?? '',
    status:      row.status,
    budget:      row.budget ?? 0,
    startDate:   row.start_date ?? '',
    endDate:     row.end_date ?? '',
    color:       row.color ?? '#6C5CE7',
    brandId:     row.brand_id ?? '',
    brandName:   row.brand_name ?? '',
  }
}
