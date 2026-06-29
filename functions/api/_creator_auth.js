import { signJWT, verifyJWT } from './_jwt.js'

// Uses BETTER_AUTH_SECRET env var (separate from internal JWT_SECRET)
function creatorEnv(env) {
  return { JWT_SECRET: env?.BETTER_AUTH_SECRET ?? 'creator-dev-secret-change-in-production' }
}

export async function signCreatorToken(payload, env) {
  return signJWT(payload, creatorEnv(env))
}

export async function verifyCreatorToken(request, env) {
  const auth = request.headers.get('Authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return { sessionError: new Response('Unauthorized', { status: 401 }) }
  const payload = await verifyJWT(token, creatorEnv(env))
  if (!payload) return { sessionError: new Response('Unauthorized', { status: 401 }) }
  return { session: payload }
}
