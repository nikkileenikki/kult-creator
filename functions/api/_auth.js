import { verifyJWT } from './_jwt'
import { err, getDB } from './_helpers'

export async function getAuthUser(request, env) {
  const header = request.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return null
  return verifyJWT(header.slice(7), env)
}

export async function requireAuth(request, env) {
  const user = await getAuthUser(request, env)
  if (!user) return { authError: err('Unauthorized', 401), user: null }

  const db = getDB(env)
  if (db) {
    try {
      const row = await db.prepare('SELECT disabled, token_version FROM users WHERE id = ?').bind(user.sub).first()
      if (!row) return { authError: err('Unauthorized', 401), user: null }
      if (row.disabled) return { authError: err('This account has been disabled', 403), user: null }
      if ((row.token_version ?? 0) !== (user.tokenVersion ?? 0)) {
        return { authError: err('Session expired — please log in again', 401), user: null }
      }
    } catch (e) {
      // Schema not migrated yet (columns added via /api/setup) — fail open so the app
      // isn't bricked between deploy and running setup, but never swallow real DB errors.
      if (!e.message?.includes('no such column')) throw e
    }
  }

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
