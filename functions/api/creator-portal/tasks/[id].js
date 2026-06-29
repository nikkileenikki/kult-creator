import { json, err, opts, getDB } from '../../_helpers.js'
import { verifyCreatorToken } from '../../_creator_auth.js'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const { session, sessionError } = await verifyCreatorToken(request, env)
  if (sessionError) return sessionError

  const creatorId = session.creatorId ?? null
  if (!creatorId) return err('No creator profile linked', 403)

  const db = getDB(env)
  const task = await db.prepare('SELECT id, status, creator_id, creator_name FROM tasks WHERE id = ?').bind(params.id).first()
  if (!task) return err('Task not found', 404)

  // Allow if task belongs to this creator OR is unassigned (open marketplace task)
  if (task.creator_id !== null && task.creator_id !== creatorId) return err('Forbidden', 403)

  let body
  try { body = await request.json() } catch { return err('Invalid JSON', 400) }
  const { status } = body ?? {}
  if (!status) return err('status required', 400)
  if (task.status !== 'Not Started' || status !== 'In Progress') return err('Invalid status transition', 400)

  if (task.creator_id === null) {
    // Accepting an open task — fetch creator name and assign it
    const creator = await db.prepare('SELECT name FROM creators WHERE id = ?').bind(creatorId).first()
    const creatorName = creator?.name ?? ''
    await db.prepare('UPDATE tasks SET status = ?, creator_id = ?, creator_name = ? WHERE id = ?')
      .bind(status, creatorId, creatorName, params.id).run()
  } else {
    await db.prepare('UPDATE tasks SET status = ? WHERE id = ?').bind(status, params.id).run()
  }

  const updated = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first()
  return json(updated)
}
