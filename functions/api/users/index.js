import { json, err, opts, getDB } from '../_helpers'
import { requireAdmin } from '../_auth'
import { hashPassword } from '../_passwords'
import { ROLE_PERMISSIONS } from '../_permissions'

export const onRequestOptions = () => opts()

function mapUser(r) {
  return { id: r.id, username: r.username, displayName: r.display_name, role: r.role, permissions: JSON.parse(r.permissions ?? '[]'), createdAt: r.created_at, creatorId: r.creator_id ?? null }
}

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAdmin(request, env)
  if (authError) return authError
  const db = getDB(env)
  const { results } = await db.prepare('SELECT id,username,display_name,role,permissions,created_at,creator_id FROM users ORDER BY created_at ASC').all()
  return json(results.map(mapUser))
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requireAdmin(request, env)
  if (authError) return authError
  const db = getDB(env)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { username, displayName, password, role, permissions: customPerms, creatorId } = body ?? {}
  if (!username || !displayName || !password) return err('username, displayName and password required', 400)
  const perms = customPerms ?? ROLE_PERMISSIONS[role] ?? []
  const hash = await hashPassword(password)
  const id = `u${Date.now()}`
  try {
    await db.prepare('INSERT INTO users (id,username,display_name,password_hash,role,permissions,creator_id) VALUES (?,?,?,?,?,?,?)')
      .bind(id, username.trim().toLowerCase(), displayName.trim(), hash, role ?? 'viewer', JSON.stringify(perms), creatorId ?? null).run()
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return err('Username already taken', 409)
    return err('Server error: ' + e.message, 500)
  }
  const created = await db.prepare('SELECT id,username,display_name,role,permissions,created_at,creator_id FROM users WHERE id = ?').bind(id).first()
  return json(mapUser(created), 201)
}
