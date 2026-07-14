import { json, err, opts, getDB } from '../../_helpers'
import { requireAuth } from '../../_auth'
import { verifyPassword, hashPassword } from '../../_passwords'

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const { authError, user } = await requireAuth(request, env)
  if (authError) return authError

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { currentPassword, newPassword } = body ?? {}
  if (!currentPassword || !newPassword) return err('currentPassword and newPassword required', 400)
  if (newPassword.length < 8) return err('New password must be at least 8 characters', 400)

  const db = getDB(env)
  const row = await db.prepare('SELECT password_hash FROM users WHERE id = ?').bind(user.sub).first()
  if (!row) return err('User not found', 404)

  const ok = await verifyPassword(currentPassword, row.password_hash)
  if (!ok) return err('Current password is incorrect', 401)

  await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(await hashPassword(newPassword), user.sub).run()
  return json({ success: true })
}
