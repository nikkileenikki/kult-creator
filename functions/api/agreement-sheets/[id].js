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

export async function onRequestPatch({ request, params, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await db.prepare('SELECT id FROM agreement_sheets WHERE id = ?').bind(params.id).first()
  if (!existing) return err('Agreement sheet not found', 404)

  const body = await request.json()
  const sets = [], vals = []
  if (body.data !== undefined) { sets.push('data = ?'); vals.push(JSON.stringify(body.data)) }
  if (body.archived !== undefined) { sets.push('archived = ?'); vals.push(body.archived ? 1 : 0) }
  if (!sets.length) return err('Nothing to update', 400)
  sets.push('updated_at = ?')
  vals.push(new Date().toISOString())

  await db.prepare(`UPDATE agreement_sheets SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, params.id).run()
  const row = await db.prepare('SELECT * FROM agreement_sheets WHERE id = ?').bind(params.id).first()
  return json(mapSheet(row))
}
