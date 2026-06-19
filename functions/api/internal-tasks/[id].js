import { json, err, opts, getDB } from '../_helpers'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ request, env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { id } = params
  const body = await request.json()
  const colMap = { title:'title', description:'description', status:'status', priority:'priority', assignee:'assignee', dueDate:'due_date' }
  const sets = [], vals = []
  for (const [key, col] of Object.entries(colMap)) {
    if (key in body) { sets.push(`${col} = ?`); vals.push(body[key]) }
  }
  if (!sets.length) return err('No fields to update')
  vals.push(id)
  await db.prepare(`UPDATE internal_tasks SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  return json({ ok: true })
}

export async function onRequestDelete({ env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  await db.prepare("UPDATE internal_tasks SET deleted_at = datetime('now') WHERE id = ?").bind(params.id).run()
  return json({ ok: true })
}
