import { json, err, opts, getDB } from '../_helpers'
import { requirePermission } from '../_auth'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ request, env, params }) {
  const { authError } = await requirePermission(request, env, 'projects.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { id } = params
  const body = await request.json()
  const colMap = { name:'name', description:'description', status:'status', priority:'priority', dueDate:'due_date', color:'color' }
  const sets = [], vals = []
  for (const [key, col] of Object.entries(colMap)) {
    if (key in body) { sets.push(`${col} = ?`); vals.push(body[key]) }
  }
  if (!sets.length) return err('No fields to update')
  vals.push(id)
  await db.prepare(`UPDATE internal_projects SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  return json({ ok: true })
}

export async function onRequestDelete({ request, env, params }) {
  const { authError } = await requirePermission(request, env, 'projects.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { id } = params
  await db.prepare("UPDATE internal_projects SET deleted_at = datetime('now') WHERE id = ?").bind(id).run()
  await db.prepare("UPDATE internal_tasks SET deleted_at = datetime('now') WHERE project_id = ?").bind(id).run()
  return json({ ok: true })
}
