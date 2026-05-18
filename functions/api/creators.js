import { json, err, opts, getDB, mapCreator } from './_helpers'
import { creatorQ } from './_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await creatorQ.list(db)
  return json(results.map(mapCreator))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const creator = {
    ...body,
    id:             `c${Date.now()}`,
    coins:          0,
    tasksCompleted: 0,
    joinedDate:     new Date().toISOString().split('T')[0],
    persona:        body.persona ?? {},
  }
  await creatorQ.create(db, creator)
  return json(mapCreator({ ...creator, persona: JSON.stringify(creator.persona), tasks_completed: 0, joined_date: creator.joinedDate, avatar_color: creator.avatarColor }), 201)
}
