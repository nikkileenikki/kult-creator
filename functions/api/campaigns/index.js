import { json, err, opts, getDB, mapCampaign } from '../_helpers'
import { campaignQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await campaignQ.list(db)
  return json(results.map(mapCampaign))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const id = `camp${Date.now()}`
  await campaignQ.create(db, { id, ...body })
  const row = await campaignQ.byId(db, id)
  return json(mapCampaign(row), 201)
}
