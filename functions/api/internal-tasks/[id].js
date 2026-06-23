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
  if (Array.isArray(body.mentions) && body.mentions.length > 0) {
    const task = await db.prepare('SELECT project_id, title FROM internal_tasks WHERE id = ?').bind(id).first()
    if (task) {
      const proj = await db.prepare('SELECT name FROM internal_projects WHERE id = ?').bind(task.project_id).first()
      const projName = proj?.name ?? ''
      for (let i = 0; i < body.mentions.length; i++) {
        const nid = `n${Date.now()}${i}${Math.random().toString(36).slice(2, 6)}`
        await db.prepare(
          'INSERT INTO notifications (id, user_display_name, task_id, project_id, task_title, message) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(nid, body.mentions[i], id, task.project_id, task.title,
          `You were mentioned in "${task.title}"${projName ? ` · ${projName}` : ''}`
        ).run()
      }
    }
  }
  return json({ ok: true })
}

export async function onRequestDelete({ env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  await db.prepare("UPDATE internal_tasks SET deleted_at = datetime('now') WHERE id = ?").bind(params.id).run()
  return json({ ok: true })
}
