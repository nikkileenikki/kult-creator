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
  return requirePermission(request, env, 'users.manage')
}

export async function requirePermission(request, env, permission) {
  const { authError, user } = await requireAuth(request, env)
  if (authError) return { authError, user: null }
  if (!user.permissions?.includes(permission)) return { authError: err('Forbidden — insufficient permissions', 403), user: null }
  return { authError: null, user }
}
