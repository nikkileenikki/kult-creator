import { json, err, opts, getDB } from '../_helpers'

export const onRequestOptions = () => opts()

export async function onRequestPatch({ env, params }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  await db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ?").bind(params.id).run()
  return json({ ok: true })
}
