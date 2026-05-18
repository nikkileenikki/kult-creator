import { json, err, opts, getDB, mapTask } from '../_helpers'
import { taskQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const result = await taskQ.update(db, params.id, body)
  if (!result) return err('No valid fields to update')
  const row = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first()
  return json(mapTask(row))
}
