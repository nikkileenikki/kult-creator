import { json, err, opts, getDB } from '../_helpers'
import { verifyPassword } from '../_passwords'
import { signJWT } from '../_jwt'

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB not found', 500)
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { username, password } = body ?? {}
  if (!username || !password) return err('Username and password required', 400)
  const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username.trim().toLowerCase()).first()
  if (!user) return err('Invalid credentials', 401)
  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return err('Invalid credentials', 401)
  const permissions = JSON.parse(user.permissions ?? '[]')
  const token = await signJWT({ sub: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions }, env)
  return json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, role: user.role, permissions } })
}
