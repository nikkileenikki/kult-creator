import { json, err, opts, getDB } from '../_helpers'
import { brandQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ request, env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  await brandQ.patch(db, params.id, body)
  return json({ id: params.id, ...body })
}

export async function onRequestDelete({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await brandQ.byId(db, params.id)
  if (!existing) return err('Brand not found', 404)
  await db.prepare('UPDATE brands SET deleted_at = ? WHERE id = ?').bind(new Date().toISOString(), params.id).run()
  return json({ success: true })
}
