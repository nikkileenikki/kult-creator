import { json, err, opts, getDB } from '../_helpers.js'
import { verifyCreatorToken } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError

  const creatorId = session.creatorId ?? null
  if (!creatorId) return json([])

  const db = getDB(env)
  const { results } = await db.prepare(
    'SELECT * FROM tasks WHERE creator_id = ? ORDER BY created_at DESC'
  ).bind(creatorId).all()
  return json(results)
}
