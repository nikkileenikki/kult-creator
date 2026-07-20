import { json, err, opts, getDB } from '../_helpers'
import { mapActivityLog } from '../_activityLog'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)

  const url        = new URL(request.url)
  const entityType = url.searchParams.get('entityType')
  const limit       = Math.min(Number(url.searchParams.get('limit') ?? 20), 200)

  const { results } = entityType
    ? await db.prepare('SELECT * FROM activity_log WHERE entity_type = ? ORDER BY created_at DESC LIMIT ?').bind(entityType, limit).all()
    : await db.prepare('SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?').bind(limit).all()

  return json(results.map(mapActivityLog))
}
