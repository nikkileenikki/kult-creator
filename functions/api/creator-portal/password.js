import { json, err, opts, getDB } from '../_helpers.js'
import { verifyCreatorToken } from '../_creator_auth.js'
import { verifyPassword, hashPassword } from '../_passwords.js'

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { currentPassword, newPassword } = body ?? {}
  if (!currentPassword || !newPassword) return err('currentPassword and newPassword required', 400)
  if (newPassword.length < 8) return err('New password must be at least 8 characters', 400)

  const db = getDB(env)
  const row = await db.prepare('SELECT password_hash FROM ca_user WHERE id = ?').bind(session.sub).first()
  if (!row) return err('Account not found', 404)

  const ok = await verifyPassword(currentPassword, row.password_hash)
  if (!ok) return err('Current password is incorrect', 401)

  await db.prepare('UPDATE ca_user SET password_hash = ? WHERE id = ?').bind(await hashPassword(newPassword), session.sub).run()
  return json({ success: true })
}
