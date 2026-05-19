import { json, err, opts, getDB } from '../_helpers'
import { brandQ } from '../_queries'

export const onRequestOptions = () => opts()

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await brandQ.list(db)
  return json(results.map(mapBrand))
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const id = `brand${Date.now()}`
  await brandQ.create(db, { id, ...body })
  const row = await brandQ.byId(db, id)
  return json(mapBrand(row), 201)
}

function mapBrand(row) {
  if (!row) return null
  return {
    id:       row.id,
    name:     row.name,
    industry: row.industry ?? '',
    color:    row.color ?? '#6C5CE7',
    website:  row.website ?? '',
  }
}
