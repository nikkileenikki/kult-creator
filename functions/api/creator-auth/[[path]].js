import { createAuth } from '../_creator_auth.js'

export async function onRequest({ request, env }) {
  const auth = createAuth(env)
  return auth.handler(request)
}
