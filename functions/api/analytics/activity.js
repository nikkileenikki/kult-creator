import { json, err, opts, getDB } from '../_helpers'
import { analyticsQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await analyticsQ.activity(db)
  return json(results)
}
