import { json, err, opts, getDB } from '../_helpers.js'
import { requirePermission } from '../_auth.js'
import { hashPassword } from '../_passwords.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError
  const db = getDB(env)
  const { results } = await db.prepare(
    'SELECT id, name, email, creator_id, created_at FROM ca_user ORDER BY created_at DESC'
  ).all()
  return json(results.map(r => ({
    id:        r.id,
    name:      r.name,
    email:     r.email,
    creatorId: r.creator_id ?? null,
    createdAt: r.created_at,
  })))
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requirePermission(request, env, 'users.manage')
  if (authError) return authError

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }

  const { email, name, password, creatorId } = body ?? {}
  if (!email || !name || !password) return err('email, name and password required', 400)

  const db = getDB(env)
  const existing = await db.prepare('SELECT id FROM ca_user WHERE email = ?').bind(email.toLowerCase().trim()).first()
  if (existing) return err('Email already in use', 409)

  const id   = `ca${Date.now()}`
  const hash = await hashPassword(password)

  try {
    await db.prepare(
      'INSERT INTO ca_user (id, name, email, password_hash, creator_id, email_verified, created_at, updated_at) VALUES (?,?,?,?,?,1,datetime(\'now\'),datetime(\'now\'))'
    ).bind(id, name.trim(), email.toLowerCase().trim(), hash, creatorId || null).run()
  } catch (e) {
    if (e.message?.includes('UNIQUE')) return err('Email already in use', 409)
    return err('Server error: ' + e.message, 500)
  }

  return json({ id, name, email: email.toLowerCase().trim(), creatorId: creatorId ?? null }, 201)
}
