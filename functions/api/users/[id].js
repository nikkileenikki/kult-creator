import { json, err, opts, getDB } from '../_helpers'
import { requireAdmin } from '../_auth'
import { hashPassword } from '../_passwords'
import { ROLE_PERMISSIONS } from '../_permissions'

export const onRequestOptions = () => opts()

function mapUser(r) {
  return { id: r.id, username: r.username, displayName: r.display_name, role: r.role, permissions: JSON.parse(r.permissions ?? '[]'), createdAt: r.created_at }
}

export async function onRequestPatch({ params, request, env }) {
  const { authError, user: caller } = await requireAdmin(request, env)
  if (authError) return authError
  const db = getDB(env)
  const existing = await db.prepare('SELECT * FROM users WHERE id = ?').bind(params.id).first()
  if (!existing) return err('User not found', 404)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }

  const isSelf = params.id === caller.sub
  if (isSelf && (body.role !== undefined || body.permissions !== undefined)) {
    const nextPerms = body.permissions ?? (body.role !== undefined ? ROLE_PERMISSIONS[body.role] ?? [] : JSON.parse(existing.permissions ?? '[]'))
    if (!nextPerms.includes('users.manage')) {
      return err('You cannot remove your own user management access', 400)
    }
  }

  const sets = [], vals = []
  if (body.displayName !== undefined) { sets.push('display_name = ?'); vals.push(body.displayName.trim()) }
  if (body.username !== undefined) {
    const uname = body.username.trim().toLowerCase()
    if (!uname) return err('username cannot be empty', 400)
    const clash = await db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(uname, params.id).first()
    if (clash) return err('Username already taken', 409)
    sets.push('username = ?'); vals.push(uname)
  }
  if (body.role !== undefined) {
    sets.push('role = ?'); vals.push(body.role)
    const perms = body.permissions ?? ROLE_PERMISSIONS[body.role] ?? []
    sets.push('permissions = ?'); vals.push(JSON.stringify(perms))
  } else if (body.permissions !== undefined) {
    sets.push('permissions = ?'); vals.push(JSON.stringify(body.permissions))
  }
  if (body.password) { sets.push('password_hash = ?'); vals.push(await hashPassword(body.password)) }
  if (!sets.length) return err('Nothing to update', 400)
  await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, params.id).run()
  const updated = await db.prepare('SELECT id,username,display_name,role,permissions,created_at FROM users WHERE id = ?').bind(params.id).first()
  return json(mapUser(updated))
}

export async function onRequestDelete({ params, request, env }) {
  const { authError, user: caller } = await requireAdmin(request, env)
  if (authError) return authError
  if (params.id === caller.sub) return err('Cannot delete your own account', 400)
  const db = getDB(env)
  const existing = await db.prepare('SELECT id FROM users WHERE id = ?').bind(params.id).first()
  if (!existing) return err('User not found', 404)
  await db.prepare('DELETE FROM users WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}
