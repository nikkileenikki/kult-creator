import { json, err, opts, getDB } from '../_helpers.js'
import { requireAuth } from '../_auth.js'
import { createAuth } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAuth(request, env)
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
  const { authError } = await requireAuth(request, env)
  if (authError) return authError

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }

  const { email, name, password, creatorId } = body ?? {}
  if (!email || !name || !password) return err('email, name and password required', 400)

  const db  = getDB(env)
  const auth = createAuth(env)

  // Check if email already used
  const existing = await db.prepare('SELECT id FROM ca_user WHERE email = ?').bind(email.toLowerCase()).first()
  if (existing) return err('Email already in use', 409)

  try {
    const response = await auth.api.signUpEmail({ body: { email, name, password } })
    const data = await response.json().catch(() => null)
    const userId = data?.user?.id

    if (creatorId && userId) {
      await db.prepare('UPDATE ca_user SET creator_id = ? WHERE id = ?').bind(creatorId, userId).run()
    }

    return json({ id: userId, name, email, creatorId: creatorId ?? null }, 201)
  } catch (e) {
    return err(e?.message ?? 'Failed to create creator account', 500)
  }
}
