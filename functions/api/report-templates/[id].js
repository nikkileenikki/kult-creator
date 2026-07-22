import { json, err, opts, getDB } from '../_helpers'
import { requireAuth, requirePermission } from '../_auth'

export const onRequestOptions = () => opts()

const FIELD_MAP = {
  title:       'title',
  reportType:  'report_type',
  fileType:    'file_type',
  dateRange:   'date_range',
  rangeStart:  'range_start',
  rangeEnd:    'range_end',
  createdBy:   'created_by',
}
const JSON_FIELD_MAP = {
  campaignIds: 'campaign_ids',
  brandNames:  'brand_names',
  creatorIds:  'creator_ids',
  pics:        'pics',
  levels:      'levels',
  metrics:     'metrics',
}

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

export async function onRequestGet({ request, params, env }) {
  const { authError } = await requireAuth(request, env)
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const row = await db.prepare('SELECT * FROM report_templates WHERE id = ? AND deleted_at IS NULL').bind(params.id).first()
  if (!row) return err('Template not found', 404)
  return json(mapTemplate(row))
}

export async function onRequestPatch({ request, env, params }) {
  const { authError } = await requirePermission(request, env, 'reports.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()

  const sets = [], vals = []
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (body[key] !== undefined) { sets.push(`${col} = ?`); vals.push(body[key]) }
  }
  for (const [key, col] of Object.entries(JSON_FIELD_MAP)) {
    if (body[key] !== undefined) { sets.push(`${col} = ?`); vals.push(JSON.stringify(body[key])) }
  }
  if (sets.length === 0) return err('No valid fields to update', 400)
  sets.push('updated_at = ?')
  vals.push(new Date().toISOString())
  vals.push(params.id)

  await db.prepare(`UPDATE report_templates SET ${sets.join(', ')} WHERE id = ? AND deleted_at IS NULL`).bind(...vals).run()
  const row = await db.prepare('SELECT * FROM report_templates WHERE id = ?').bind(params.id).first()
  if (!row) return err('Template not found', 404)
  return json({ id: row.id })
}

export async function onRequestDelete({ request, params, env }) {
  const { authError } = await requirePermission(request, env, 'reports.manage')
  if (authError) return authError
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const existing = await db.prepare('SELECT id FROM report_templates WHERE id = ? AND deleted_at IS NULL').bind(params.id).first()
  if (!existing) return err('Template not found', 404)
  await db.prepare('UPDATE report_templates SET deleted_at = ? WHERE id = ?').bind(new Date().toISOString(), params.id).run()
  return json({ success: true })
}
