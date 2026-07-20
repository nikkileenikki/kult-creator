import { json, err, opts, getDB } from '../_helpers'

export const onRequestOptions = () => opts()

// Per-task first-occurrence timestamps derived from the activity log:
// when it was created, first started (assigned), first submitted for review, first completed.
export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)

  const { results } = await db.prepare(
    "SELECT entity_id, action, to_status, created_at FROM activity_log WHERE entity_type = 'task' ORDER BY created_at ASC"
  ).all()

  const timeline = {}
  for (const r of results) {
    const t = timeline[r.entity_id] ?? (timeline[r.entity_id] = {})
    if (r.action === 'created' && !t.createdAt) t.createdAt = r.created_at
    if (r.to_status === 'In Progress' && !t.assignedAt) t.assignedAt = r.created_at
    if (r.to_status === 'Under Review' && !t.submittedAt) t.submittedAt = r.created_at
    if (r.to_status === 'Completed' && !t.completedAt) t.completedAt = r.created_at
  }

  return json(timeline)
}
