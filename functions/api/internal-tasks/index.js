import { json, err, opts, getDB } from '../_helpers'

function mapTask(row) {
  if (!row) return null
  return {
    id:          row.id,
    projectId:   row.project_id,
    title:       row.title,
    description: row.description ?? '',
    status:      row.status,
    priority:    row.priority,
    assignee:    row.assignee ?? '',
    dueDate:     row.due_date ?? '',
    createdAt:   row.created_at,
  }
}

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const url = new URL(request.url)
  const projectId = url.searchParams.get('projectId')
  let query = 'SELECT * FROM internal_tasks WHERE deleted_at IS NULL'
  const vals = []
  if (projectId) { query += ' AND project_id = ?'; vals.push(projectId) }
  query += ' ORDER BY created_at ASC'
  const { results } = await db.prepare(query).bind(...vals).all()
  return json(results.map(mapTask))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  try {
    const body = await request.json()
    const id = `it${Date.now()}`
    await db.prepare(`
      INSERT INTO internal_tasks (id, project_id, title, description, status, priority, assignee, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.projectId, body.title, body.description ?? '', body.status ?? 'To Do', body.priority ?? 'Medium', body.assignee ?? '', body.dueDate ?? '').run()
    const row = await db.prepare('SELECT * FROM internal_tasks WHERE id = ?').bind(id).first()
    return json(mapTask(row), 201)
  } catch (e) {
    return err(e?.message ?? 'Failed to create task', 500)
  }
}
