import { json, opts } from '../_helpers.js'
import { verifyCreatorToken } from '../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError
  return json({ user: { id: session.sub, name: session.name, email: session.email, creatorId: session.creatorId ?? null } })
}
