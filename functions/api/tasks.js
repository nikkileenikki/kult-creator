import { json, err, opts, getDB, mapTask } from './_helpers'
import { taskQ } from './_queries'
import { logActivity } from './_activityLog'

export const onRequestOptions = () => opts()

export async function onRequestGet({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { searchParams } = new URL(request.url)
  const filters = {}
  if (searchParams.get('creatorId')) filters.creatorId = searchParams.get('creatorId')
  if (searchParams.get('status'))    filters.status    = searchParams.get('status')
  if (searchParams.get('project'))   filters.project   = searchParams.get('project')
  const { results } = await taskQ.list(db, filters)
  return json(results.map(mapTask))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  try {
    const body = await request.json()
    const task = { ...body, id: `t${Date.now()}` }
    await taskQ.create(db, task)
    await logActivity(db, {
      entityType: 'task', entityId: task.id, entityName: task.task ?? '',
      action: 'created', fromStatus: '', toStatus: task.status || 'Not Started',
      actor: task.pic || '', meta: { project: task.project },
    })
    return json(mapTask({
      ...task,
      creator_id:   task.creatorId,
      creator_name: task.creatorName,
      due_date:     task.dueDate,
    }), 201)
  } catch (e) {
    return err(e?.message ?? 'Failed to create task', 500)
  }
}
