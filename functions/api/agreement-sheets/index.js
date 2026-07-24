import { json, err, opts, getDB } from '../_helpers'
import { requirePermission } from '../_auth'

export const onRequestOptions = () => opts()

function mapSheet(row) {
  if (!row) return null
  let data = {}
  try { data = JSON.parse(row.data || '{}') } catch { /* ignore */ }
  return {
    id:        row.id,
    creatorId: row.creator_id,
    data,
    archived:  !!row.archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function onRequestGet({ request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await db.prepare('SELECT * FROM agreement_sheets ORDER BY updated_at DESC').all()
  return json(results.map(mapSheet))
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  if (!body.creatorId) return err('creatorId is required', 400)

  const id = `ag_${Date.now()}`
  const now = new Date().toISOString()
  await db.prepare(
    'INSERT INTO agreement_sheets (id, creator_id, data, archived, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)'
  ).bind(id, body.creatorId, JSON.stringify(body.data || {}), now, now).run()

  const row = await db.prepare('SELECT * FROM agreement_sheets WHERE id = ?').bind(id).first()
  return json(mapSheet(row), 201)
}
