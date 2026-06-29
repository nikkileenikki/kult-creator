import { createAuth } from '../_creator_auth.js'
import { json, err, opts, getDB } from '../_helpers.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const auth = createAuth(env)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return err('Unauthorized', 401)

  const creatorId = session.user.creatorId ?? null
  if (!creatorId) return json({ creator: null, user: { id: session.user.id, name: session.user.name, email: session.user.email } })

  const db = getDB(env)
  const creator = await db.prepare('SELECT * FROM creators WHERE id = ?').bind(creatorId).first()
  return json({ creator: creator ?? null, user: { id: session.user.id, name: session.user.name, email: session.user.email } })
}
