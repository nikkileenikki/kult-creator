import { json, err, opts, getDB } from '../_helpers'
import { requireAuth, requirePermission } from '../_auth'

export const onRequestOptions = () => opts()

function mapTemplate(row) {
  if (!row) return null
  return {
    id:          row.id,
    title:       row.title,
    reportType:  row.report_type,
    fileType:    row.file_type,
    dateRange:   row.date_range,
    rangeStart:  row.range_start,
    rangeEnd:    row.range_end,
    campaignIds: JSON.parse(row.campaign_ids || '[]'),
    brandNames:  JSON.parse(row.brand_names || '[]'),
    creatorIds:  JSON.parse(row.creator_ids || '[]'),
    pics:        JSON.parse(row.pics || '[]'),
    levels:      JSON.parse(row.levels || '[]'),
    metrics:     JSON.parse(row.metrics || '[]'),
    createdBy:   row.created_by,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  }
}

export async function onRequestGet({ request, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await db.prepare(
    'SELECT * FROM report_templates WHERE deleted_at IS NULL ORDER BY updated_at DESC'
  ).all()
  return json(results.map(mapTemplate))
}

export async function onRequestPost({ request, env }) {
  const { authError } = await requirePermission(request, env, 'reports.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  if (!body.title?.trim()) return err('title is required', 400)

  const id = `rt_${Date.now()}`
  const now = new Date().toISOString()
  await db.prepare(`
    INSERT INTO report_templates
      (id, title, report_type, file_type, date_range, range_start, range_end, campaign_ids, brand_names, creator_ids, pics, levels, metrics, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id, body.title.trim(), body.reportType || 'summary', body.fileType || 'csv',
    body.dateRange || 'all', body.rangeStart || '', body.rangeEnd || '',
    JSON.stringify(body.campaignIds || []), JSON.stringify(body.brandNames || []),
    JSON.stringify(body.creatorIds || []), JSON.stringify(body.pics || []),
    JSON.stringify(body.levels || ['campaign', 'creator']), JSON.stringify(body.metrics || []),
    body.createdBy || '', now, now,
  ).run()

  const row = await db.prepare('SELECT * FROM report_templates WHERE id = ?').bind(id).first()
  return json(mapTemplate(row), 201)
}
