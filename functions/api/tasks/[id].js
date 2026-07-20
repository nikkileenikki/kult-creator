import { json, err, opts, getDB, mapTask } from '../_helpers'
import { taskQ } from '../_queries'
import { logActivity } from '../_activityLog'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()

  const prev = await db.prepare('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL').bind(params.id).first()
  if (!prev) return err('Task not found', 404)

  const result = await taskQ.update(db, params.id, body)
  if (!result) return err('No valid fields to update')

  if (body.status && body.status !== prev.status) {
    await logActivity(db, {
      entityType: 'task', entityId: params.id, entityName: prev.task,
      action: 'status_changed', fromStatus: prev.status, toStatus: body.status,
      actor: prev.pic || '', meta: { project: prev.project, creatorName: prev.creator_name },
    })
  }

  // Log activity when a task is newly marked Completed
  if (body.status === 'Completed' && prev.status !== 'Completed' && prev.creator_name && prev.creator_name !== 'Unassigned') {
    const coins = body.coins ?? prev.coins ?? 0
    const text  = `<strong>${prev.creator_name}</strong> completed ${prev.task}${coins ? ` — <strong>+${coins} coins</strong>` : ''}`
    const id    = `act_${Date.now()}`
    await db.prepare(
      'INSERT INTO activity_feed (id, color, text, time, created_at, creator_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, 'green', text, 'Just now', new Date().toISOString(), prev.creator_id || null).run()
  }

  const row = await db.prepare('SELECT * FROM tasks WHERE id = ?').bind(params.id).first()
  return json(mapTask(row))
}

export async function onRequestDelete({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await db.prepare('SELECT id FROM tasks WHERE id = ? AND deleted_at IS NULL').bind(params.id).first()
  if (!existing) return err('Task not found', 404)
  await db.prepare('UPDATE tasks SET deleted_at = ? WHERE id = ?').bind(new Date().toISOString(), params.id).run()
  return json({ success: true })
}
