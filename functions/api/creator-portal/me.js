import { json, err, opts, getDB } from '../_helpers.js'
import { verifyCreatorToken } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError

  const creatorId = session.creatorId ?? null
  if (!creatorId) return json({ creator: null, user: { id: session.sub, name: session.name, email: session.email } })

  const db = getDB(env)
  const creator = await db.prepare('SELECT * FROM creators WHERE id = ?').bind(creatorId).first()
  return json({ creator: creator ?? null, user: { id: session.sub, name: session.name, email: session.email } })
}
