import { json, err, opts, getDB, mapTask } from './_helpers'
import { taskQ } from './_queries'

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
  const body = await request.json()
  const task = { ...body, id: `t${Date.now()}` }
  await taskQ.create(db, task)
  return json(mapTask({
    ...task,
    creator_id:   task.creatorId,
    creator_name: task.creatorName,
    due_date:     task.dueDate,
  }), 201)
}
