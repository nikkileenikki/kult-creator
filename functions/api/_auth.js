import { verifyJWT } from './_jwt'
import { err } from './_helpers'

export async function getAuthUser(request, env) {
  const header = request.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return null
  return verifyJWT(header.slice(7), env)
}

export async function requireAuth(request, env) {
  const user = await getAuthUser(request, env)
  if (!user) return { authError: err('Unauthorized', 401), user: null }
  return { authError: null, user }
}

export async function requireAdmin(request, env) {
  const { authError, user } = await requireAuth(request, env)
  if (authError) return { authError, user: null }
  if (!user.permissions?.includes('users.manage')) return { authError: err('Forbidden — admin only', 403), user: null }
  return { authError: null, user }
}
