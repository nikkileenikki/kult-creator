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
  const result = await creatorQ.patch(db, params.id, body)
  if (!result) return err('No valid fields to update')
  const updated = await creatorQ.byId(db, params.id)
  return json(mapCreator(updated))
}
