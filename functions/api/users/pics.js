import { json, err, opts, getDB } from '../_helpers'
import { requireAuth } from '../_auth'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await db.prepare(
    "SELECT display_name FROM users WHERE role != 'viewer' ORDER BY display_name ASC"
  ).all()
  return json(results.map(r => r.display_name))
}
