import { json, opts, getDB } from '../_helpers.js'
import { verifyCreatorToken } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError

  const creatorId = session.creatorId ?? null
  const db = getDB(env)

  const { results: campaigns } = await db.prepare('SELECT id, name, color, brand_name FROM campaigns').all()
  const campaignMap = Object.fromEntries(campaigns.map(c => [c.name, c]))

  const myTasks = creatorId
    ? (await db.prepare('SELECT * FROM tasks WHERE creator_id = ? AND deleted_at IS NULL ORDER BY created_at DESC').bind(creatorId).all()).results
    : []

  const { results: openTasks } = await db.prepare(
    "SELECT * FROM tasks WHERE creator_id IS NULL AND status = 'Not Started' AND deleted_at IS NULL ORDER BY created_at DESC"
  ).all()

  function enrich(t) {
    const campaign = campaignMap[t.project] ?? null
    return { ...t, campaign_color: campaign?.color ?? null, brand_name: campaign?.brand_name ?? null }
  }

  return json({
    myTasks:   myTasks.map(enrich),
    openTasks: openTasks.map(enrich),
  })
}
