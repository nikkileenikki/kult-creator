import { json, err, opts, getDB } from '../_helpers.js'
import { requireAuth } from '../_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestDelete({ params, request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  const existing = await db.prepare('SELECT id FROM ca_user WHERE id = ?').bind(params.id).first()
  if (!existing) return err('Creator account not found', 404)
  // Cascade: sessions and accounts deleted by FK ON DELETE CASCADE
  await db.prepare('DELETE FROM ca_user WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}

export async function onRequestPatch({ params, request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { creatorId } = body ?? {}
  if (creatorId === undefined) return err('Nothing to update', 400)
  await db.prepare('UPDATE ca_user SET creator_id = ? WHERE id = ?').bind(creatorId || null, params.id).run()
  const updated = await db.prepare('SELECT id, name, email, creator_id, created_at FROM ca_user WHERE id = ?').bind(params.id).first()
  return json({ id: updated.id, name: updated.name, email: updated.email, creatorId: updated.creator_id ?? null })
}
