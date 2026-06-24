import { verifyJWT } from './_jwt'
import { getDB, err } from './_helpers'

export async function getAuthUser(request, env) {
  const header = request.headers.get('Authorization') ?? ''
  if (!header.startsWith('Bearer ')) return null
  const payload = await verifyJWT(header.slice(7), env)
  if (!payload) return null

  // Verify token_version and disabled status on every request
  const db = getDB(env)
  if (db) {
    let row
    try {
      row = await db.prepare('SELECT token_version, disabled FROM users WHERE id = ?').bind(payload.sub).first()
    } catch { return null }
    if (!row) return null
    if (row.disabled) return null
    // token_version check: if it's in the JWT, it must match the DB
    if (payload.token_version !== undefined && row.token_version !== payload.token_version) return null
  }

  return payload
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
