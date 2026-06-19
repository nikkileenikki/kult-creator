import { json, err, opts, getDB } from '../_helpers'

function mapProject(row) {
  if (!row) return null
  return {
    id:          row.id,
    name:        row.name,
    description: row.description ?? '',
    status:      row.status,
    priority:    row.priority,
    dueDate:     row.due_date ?? '',
    color:       row.color ?? '#6C5CE7',
    createdAt:   row.created_at,
  }
}

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await db.prepare(
    'SELECT * FROM internal_projects WHERE deleted_at IS NULL ORDER BY created_at DESC'
  ).all()
  return json(results.map(mapProject))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  try {
    const body = await request.json()
    const id = `ip${Date.now()}`
    await db.prepare(`
      INSERT INTO internal_projects (id, name, description, status, priority, due_date, color)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(id, body.name, body.description ?? '', body.status ?? 'Active', body.priority ?? 'Medium', body.dueDate ?? '', body.color ?? '#6C5CE7').run()
    const row = await db.prepare('SELECT * FROM internal_projects WHERE id = ?').bind(id).first()
    return json(mapProject(row), 201)
  } catch (e) {
    return err(e?.message ?? 'Failed to create project', 500)
  }
}
