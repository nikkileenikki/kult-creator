import { json, err, opts, getDB } from '../../_helpers'
import { taskQ } from '../../_queries'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ params, request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { status } = await request.json()
  if (!status) return err('status is required')
  await taskQ.updateStatus(db, params.id, status)
  return json({ id: params.id, status })
}
