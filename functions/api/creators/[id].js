import { json, err, opts, getDB, mapCreator } from '../_helpers'
import { creatorQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const row = await creatorQ.byId(db, params.id)
  if (!row) return err('Creator not found', 404)
  return json(mapCreator(row))
}

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()

  const existing = await creatorQ.byId(db, params.id)
  if (!existing) return err('Creator not found', 404)

  const merged = {
    name:           body.name           ?? existing.name,
    initials:       body.initials       ?? existing.initials,
    platform:       body.platform       ?? existing.platform,
    niche:          body.niche          ?? existing.niche,
    secondaryNiche: body.secondaryNiche ?? existing.secondary_niche ?? '',
    followers:      body.followers      ?? existing.followers,
    coins:          body.coins          ?? existing.coins,
    tasksCompleted: body.tasksCompleted ?? existing.tasks_completed,
    status:         body.status         ?? existing.status,
    pic:            body.pic            ?? existing.pic,
    contact:        body.contact        ?? existing.contact,
    avatarColor:    body.avatarColor    ?? existing.avatar_color,
    persona:        body.persona !== undefined ? body.persona : existing.persona,
  }

  await creatorQ.fullUpdate(db, params.id, merged)
  const updated = await creatorQ.byId(db, params.id)
  return json(mapCreator(updated))
}
