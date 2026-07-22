import { json, err, opts, getDB } from '../_helpers.js'
import { requirePermission } from '../_auth.js'
import { hashPassword } from '../_passwords.js'

export const onRequestOptions = () => opts()

export async function onRequestDelete({ params, request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  const existing = await db.prepare('SELECT id FROM ca_user WHERE id = ?').bind(params.id).first()
  if (!existing) return err('Creator account not found', 404)
  await db.prepare('DELETE FROM ca_user WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}

export async function onRequestPatch({ params, request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  const existing = await db.prepare('SELECT id FROM ca_user WHERE id = ?').bind(params.id).first()
  if (!existing) return err('Creator account not found', 404)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }

  const sets = [], vals = []
  if (body.name !== undefined)      { sets.push('name = ?');         vals.push(body.name.trim()) }
  if (body.email !== undefined) {
    const email = body.email.toLowerCase().trim()
    const clash = await db.prepare('SELECT id FROM ca_user WHERE email = ? AND id != ?').bind(email, params.id).first()
    if (clash) return err('Email already in use', 409)
    sets.push('email = ?'); vals.push(email)
  }
  if (body.password)                { sets.push('password_hash = ?'); vals.push(await hashPassword(body.password)) }
  if (body.creatorId !== undefined) { sets.push('creator_id = ?');    vals.push(body.creatorId || null) }

  if (!sets.length) return err('Nothing to update', 400)
  sets.push('updated_at = datetime(\'now\')')
  await db.prepare(`UPDATE ca_user SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, params.id).run()
  const updated = await db.prepare('SELECT id, name, email, creator_id, created_at FROM ca_user WHERE id = ?').bind(params.id).first()
  return json({ id: updated.id, name: updated.name, email: updated.email, creatorId: updated.creator_id ?? null, createdAt: updated.created_at })
}
