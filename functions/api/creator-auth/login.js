import { json, err, opts, getDB } from '../_helpers.js'
import { verifyPassword } from '../_passwords.js'
import { signCreatorToken } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestPost({ request, env }) {
  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { email, password } = body ?? {}
  if (!email || !password) return err('email and password required', 400)

  const db = getDB(env)
  const user = await db.prepare('SELECT * FROM ca_user WHERE email = ?').bind(email.toLowerCase().trim()).first()
  if (!user) return err('Invalid email or password', 401)

  const ok = await verifyPassword(password, user.password_hash)
  if (!ok) return err('Invalid email or password', 401)

  const token = await signCreatorToken({
    sub:       user.id,
    name:      user.name,
    email:     user.email,
    creatorId: user.creator_id ?? null,
  }, env)

  return json({ token, user: { id: user.id, name: user.name, email: user.email, creatorId: user.creator_id ?? null } })
}
