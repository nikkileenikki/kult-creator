import { json, err, opts, getDB } from '../_helpers'
import { requireAuth } from '../_auth'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB not found', 500)
  const { results } = await db.prepare('SELECT id, name FROM niches ORDER BY name ASC').all()
  return json(results)
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB not found', 500)
  const { name } = await request.json()
  if (!name?.trim()) return err('Name required', 400)
  const id = `n_${Date.now()}`
  await db.prepare('INSERT INTO niches (id, name) VALUES (?, ?)').bind(id, name.trim()).run()
  return json({ id, name: name.trim() })
}
