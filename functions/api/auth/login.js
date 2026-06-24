import { json, err, opts, getDB } from '../_helpers'
import { verifyPassword } from '../_passwords'
import { signJWT } from '../_jwt'

export const onRequestOptions = () => opts()

function parseDevice(ua) {
  if (!ua) return 'Unknown device'
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua)
  let os = 'Unknown OS'
  if (/Windows/.test(ua))           os = 'Windows'
  else if (/Mac OS X/.test(ua))     os = 'macOS'
  else if (/Android/.test(ua))      os = 'Android'
  else if (/iPhone|iPad/.test(ua))  os = 'iOS'
  else if (/Linux/.test(ua))        os = 'Linux'
  let browser = 'Unknown browser'
  if (/Edg\//.test(ua))                          browser = 'Edge'
  else if (/OPR|Opera/.test(ua))                 browser = 'Opera'
  else if (/Chrome/.test(ua))                    browser = 'Chrome'
  else if (/Firefox/.test(ua))                   browser = 'Firefox'
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari'
  return `${browser} · ${os} · ${mobile ? 'Mobile' : 'Desktop'}`
}

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
  if (user.disabled) return err('Account disabled. Contact an administrator.', 403)
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return err('Invalid credentials', 401)

  // Capture login metadata
  const ip      = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || null
  const ua      = request.headers.get('User-Agent') || null
  const device  = parseDevice(ua)
  const country = request.cf?.country || null
  const city    = request.cf?.city    || null
  const now     = new Date().toISOString()

  await db.prepare(
    `UPDATE users SET last_login_at = ?, last_login_ip = ?, last_login_device = ?, last_login_country = ?, last_login_city = ? WHERE id = ?`
  ).bind(now, ip, device, country, city, user.id).run()

  const tokenVersion = user.token_version ?? 0
  const permissions = JSON.parse(user.permissions ?? '[]')
  const token = await signJWT(
    { sub: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions, token_version: tokenVersion },
    env
  )
  return json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions } })
}
