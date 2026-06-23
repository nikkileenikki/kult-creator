import { json, err, opts, getDB } from '../_helpers'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const user = new URL(request.url).searchParams.get('user')
  if (!user) return json([])
  const { results } = await db.prepare(
    'SELECT * FROM notifications WHERE user_display_name = ? AND read_at IS NULL ORDER BY created_at DESC LIMIT 50'
  ).bind(user).all()
  return json(results.map(r => ({
    id: r.id, taskId: r.task_id, projectId: r.project_id,
    taskTitle: r.task_title, message: r.message, createdAt: r.created_at,
  })))
}
