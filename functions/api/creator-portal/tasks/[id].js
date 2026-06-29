import { createAuth } from '../../_creator_auth.js'
import { json, err, opts, getDB } from '../../_helpers.js'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const auth = createAuth(env)
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) return err('Unauthorized', 401)

  const creatorId = session.user.creatorId ?? null
  if (!creatorId) return err('No creator profile linked', 403)

  const db = getDB(env)
  const task = await db.prepare('SELECT id, status, creator_id FROM tasks WHERE id = ?').bind(params.id).first()
  if (!task) return err('Task not found', 404)
  if (task.creator_id !== creatorId) return err('Forbidden', 403)

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { status } = body ?? {}
  if (!status) return err('status required', 400)
  // Creators can only move Not Started → In Progress
  if (task.status !== 'Not Started' || status !== 'In Progress') return err('Invalid status transition', 400)

  await db.prepare('UPDATE tasks SET status = ? WHERE id = ?').bind(status, params.id).run()
  const updated = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first()
  return json(updated)
}
