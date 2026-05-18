import { json, err, opts, getDB, mapRecruit } from './_helpers'
import { recruitQ } from './_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await recruitQ.list(db)
  return json(results.map(mapRecruit))
}
