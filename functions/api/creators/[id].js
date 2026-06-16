import { json, err, opts, getDB, mapCreator } from '../_helpers'
import { creatorQ } from '../_queries'
import { encryptField, decryptField } from '../_crypto'

export const onRequestOptions = () => opts()

export async function onRequestGet({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const row = await creatorQ.byId(db, params.id)
  if (!row) return err('Creator not found', 404)
  row.contact_number = await decryptField(row.contact_number, env)
  row.email          = await decryptField(row.email, env)
  return json(mapCreator(row))
}

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()

  const existing = await creatorQ.byId(db, params.id)
  if (!existing) return err('Creator not found', 404)

  const merged = {
    name:             body.name             ?? existing.name,
    initials:         body.initials         ?? existing.initials,
    platform:         body.platform         ?? existing.platform,
    niche:            body.niche            ?? existing.niche,
    secondaryNiche:   body.secondaryNiche   ?? existing.secondary_niche   ?? '',
    followers:        body.followers        ?? existing.followers,
    coins:            body.coins            ?? existing.coins,
    tasksCompleted:   body.tasksCompleted   ?? existing.tasks_completed,
    status:           body.status           ?? existing.status,
    pic:              body.pic              ?? existing.pic,
    contact:          body.contact          ?? existing.contact,
    avatarColor:      body.avatarColor      ?? existing.avatar_color,
    persona:          body.persona !== undefined ? body.persona : existing.persona,
    platformUsername: body.platformUsername ?? existing.platform_username ?? '',
    dateOfBirth:      body.dateOfBirth      ?? existing.date_of_birth     ?? '',
    // Encrypt new values; keep existing encrypted blob if field not in body
    contactNumber:    body.contactNumber !== undefined
      ? await encryptField(body.contactNumber, env)
      : existing.contact_number ?? '',
    email:            body.email !== undefined
      ? await encryptField(body.email, env)
      : existing.email ?? '',
  }

  await creatorQ.fullUpdate(db, params.id, merged)
  const updated = await creatorQ.byId(db, params.id)
  updated.contact_number = await decryptField(updated.contact_number, env)
  updated.email          = await decryptField(updated.email, env)
  return json(mapCreator(updated))
}

export async function onRequestDelete({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await creatorQ.byId(db, params.id)
  if (!existing) return err('Creator not found', 404)
  const now = new Date().toISOString()
  await db.prepare('UPDATE creators SET deleted_at = ? WHERE id = ?').bind(now, params.id).run()
  await db.prepare('UPDATE tasks SET deleted_at = ? WHERE creator_id = ?').bind(now, params.id).run()
  await db.prepare('UPDATE activity_feed SET deleted_at = ? WHERE creator_id = ?').bind(now, params.id).run()
  return json({ success: true })
}
