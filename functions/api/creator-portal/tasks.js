import { createAuth } from '../_creator_auth.js'
import { json, err, opts, getDB } from '../_helpers.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const auth = createAuth(env)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return err('Unauthorized', 401)

  const creatorId = session.user.creatorId ?? null
  if (!creatorId) return json([])

  const db = getDB(env)
  const { results } = await db.prepare(
    'SELECT * FROM tasks WHERE creator_id = ? ORDER BY created_at DESC'
  ).bind(creatorId).all()
  return json(results)
}
