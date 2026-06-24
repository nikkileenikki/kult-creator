import { json, err, opts, getDB } from '../_helpers'
import { requireAdmin } from '../_auth'
import { hashPassword } from '../_passwords'
import { ROLE_PERMISSIONS } from '../_permissions'

export const onRequestOptions = () => opts()

function mapUser(r) {
  return {
    id:              r.id,
    username:        r.username,
    displayName:     r.display_name,
    role:            r.role,
    permissions:     JSON.parse(r.permissions ?? '[]'),
    createdAt:       r.created_at,
    disabled:        !!r.disabled,
    lastLoginAt:     r.last_login_at     ?? null,
    lastLoginIp:     r.last_login_ip     ?? null,
    lastLoginDevice: r.last_login_device ?? null,
    lastLoginCountry:r.last_login_country ?? null,
    lastLoginCity:   r.last_login_city   ?? null,
  }
}

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAdmin(request, env)
  if (authError) return authError
  const db = getDB(env)
  const { results } = await db.prepare(
    'SELECT id,username,display_name,role,permissions,created_at,disabled,last_login_at,last_login_ip,last_login_device,last_login_country,last_login_city FROM users ORDER BY created_at ASC'
  ).all()
  return json(results.map(mapUser))
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requireAdmin(request, env)
  if (authError) return authError
  const db = getDB(env)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { username, displayName, password, role, permissions: customPerms } = body ?? {}
  if (!username || !displayName || !password) return err('username, displayName and password required', 400)
  const perms = customPerms ?? ROLE_PERMISSIONS[role] ?? []
  const hash = await hashPassword(password)
  const id = `u${Date.now()}`
  try {
    await db.prepare('INSERT INTO users (id,username,display_name,password_hash,role,permissions) VALUES (?,?,?,?,?,?)')
      .bind(id, username.trim().toLowerCase(), displayName.trim(), hash, role ?? 'viewer', JSON.stringify(perms)).run()
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return err('Username already taken', 409)
    return err('Server error: ' + e.message, 500)
  }
  const created = await db.prepare(
    'SELECT id,username,display_name,role,permissions,created_at,disabled,last_login_at,last_login_ip,last_login_device,last_login_country,last_login_city FROM users WHERE id = ?'
  ).bind(id).first()
  return json(mapUser(created), 201)
}
