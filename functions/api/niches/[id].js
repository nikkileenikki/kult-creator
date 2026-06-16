import { json, err, opts, getDB } from '../_helpers'
import { requireAuth } from '../_auth'

export const onRequestOptions = () => opts()

export async function onRequestDelete({ params, request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB not found', 500)
  await db.prepare('DELETE FROM niches WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}
