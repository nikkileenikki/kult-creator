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

export async function onRequestDelete({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await db.prepare('SELECT id FROM tasks WHERE id = ?').bind(params.id).first()
  if (!existing) return err('Task not found', 404)
  await db.prepare('DELETE FROM tasks WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}
