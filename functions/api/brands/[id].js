import { json, err, opts, getDB } from '../_helpers'
import { brandQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ request, env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  await brandQ.patch(db, params.id, body)
  return json({ id: params.id, ...body })
}
