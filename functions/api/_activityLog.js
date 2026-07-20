export async function logActivity(db, { entityType, entityId, entityName = '', action, fromStatus = '', toStatus = '', actor = '', meta = {} }) {
  const id = `al_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const createdAt = new Date().toISOString()
  await db.prepare(
    'INSERT INTO activity_log (id, entity_type, entity_id, entity_name, action, from_status, to_status, actor, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, entityType, entityId, entityName, action, fromStatus, toStatus, actor, JSON.stringify(meta), createdAt).run()
}

export function mapActivityLog(row) {
  if (!row) return null
  let meta = {}
  try { meta = JSON.parse(row.meta ?? '{}') } catch {}
  return {
    id:         row.id,
    entityType: row.entity_type,
    entityId:   row.entity_id,
    entityName: row.entity_name,
    action:     row.action,
    fromStatus: row.from_status,
    toStatus:   row.to_status,
    actor:      row.actor,
    meta,
    createdAt:  row.created_at,
  }
}
