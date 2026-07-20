import { json, err, opts, getDB } from '../_helpers'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)

  const since7  = new Date(Date.now() - 7  * 86400000).toISOString()
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString()

  const { results: taskCompletions } = await db.prepare(
    "SELECT entity_id, created_at FROM activity_log WHERE entity_type = 'task' AND to_status = 'Completed'"
  ).all()
  const { results: taskStarts } = await db.prepare(
    "SELECT entity_id, created_at FROM activity_log WHERE entity_type = 'task' AND to_status = 'In Progress' ORDER BY created_at ASC"
  ).all()
  const { results: recruitApprovals } = await db.prepare(
    "SELECT entity_id, created_at FROM activity_log WHERE entity_type = 'recruit' AND to_status = 'Approved'"
  ).all()
  const { results: recruits } = await db.prepare('SELECT id, applied_date FROM recruit_requests').all()

  const completedLast7  = taskCompletions.filter(r => r.created_at >= since7).length
  const completedLast30 = taskCompletions.filter(r => r.created_at >= since30).length

  const startMap = new Map()
  for (const r of taskStarts) if (!startMap.has(r.entity_id)) startMap.set(r.entity_id, r.created_at)
  const completionDurations = []
  for (const c of taskCompletions) {
    const start = startMap.get(c.entity_id)
    if (start) completionDurations.push((new Date(c.created_at) - new Date(start)) / 3600000)
  }
  const avgCompletionHours = completionDurations.length
    ? completionDurations.reduce((a, b) => a + b, 0) / completionDurations.length
    : null

  const recruitAppliedMap = new Map(recruits.map(r => [r.id, r.applied_date]))
  const approvalDurations = []
  for (const a of recruitApprovals) {
    const applied = recruitAppliedMap.get(a.entity_id)
    if (applied) approvalDurations.push((new Date(a.created_at) - new Date(applied)) / 3600000)
  }
  const avgApprovalHours = approvalDurations.length
    ? approvalDurations.reduce((a, b) => a + b, 0) / approvalDurations.length
    : null

  return json({
    completedLast7,
    completedLast30,
    avgCompletionHours,
    avgApprovalHours,
    sampleSize: { completions: completionDurations.length, approvals: approvalDurations.length },
  })
}
