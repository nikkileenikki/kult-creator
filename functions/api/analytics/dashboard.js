import { json, err, opts, getDB } from '../_helpers'
import { analyticsQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const m = await analyticsQ.dashboard(db)
  return json({
    activeCreators:  m.active_creators,
    dueThisWeek:     m.due_this_week,
    overdue:         m.overdue,
    completionRate:  m.total_tasks ? Math.round((m.completed / m.total_tasks) * 100) : 0,
    pendingRecruits: m.pending_recruits,
  })
}
