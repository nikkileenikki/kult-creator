import { json, err, opts, getDB } from '../_helpers'
import { verifyPassword } from '../_passwords'
import { signJWT } from '../_jwt'
import { describeDevice, getRequestLocation } from '../_deviceInfo'

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB not found', 500)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { username, password } = body ?? {}
  if (!username || !password) return err('Username and password required', 400)

  let user
  try {
    user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username.trim().toLowerCase()).first()
  } catch (e) {
    if (e.message?.includes('no such table')) {
      return err('Users table not found — please visit /api/setup to initialise the database', 503)
    }
    return err('Database error: ' + e.message, 500)
  }

  if (!user) return err('Invalid credentials', 401)
  if (user.disabled) return err('This account has been disabled. Contact an admin for access.', 403)
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return err('Invalid credentials', 401)

  const { ip, country, city } = getRequestLocation(request)
  const device = describeDevice(request.headers.get('User-Agent'))
  await db.prepare(
    `UPDATE users SET last_login_at = datetime('now'), last_login_ip = ?, last_login_device = ?, last_login_country = ?, last_login_city = ? WHERE id = ?`
  ).bind(ip, device, country, city, user.id).run().catch(() => {})

  const permissions = JSON.parse(user.permissions ?? '[]')
  const tokenVersion = user.token_version ?? 0
  const token = await signJWT({ sub: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions, tokenVersion }, env)
  return json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions } })
}
