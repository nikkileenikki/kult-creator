import { json, err, opts, getDB, mapCampaign } from '../_helpers'
import { campaignQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const result = await campaignQ.patch(db, params.id, body)
  if (!result) return err('No valid fields to update')
  const row = await campaignQ.byId(db, params.id)
  return json(mapCampaign(row))
}

export async function onRequestDelete({ params, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await campaignQ.byId(db, params.id)
  if (!existing) return err('Campaign not found', 404)
  await db.prepare('DELETE FROM campaigns WHERE id = ?').bind(params.id).run()
  return json({ success: true })
}
