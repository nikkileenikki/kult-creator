import { json, err, opts, getDB, mapCreator } from './_helpers'
import { creatorQ } from './_queries'
import { encryptField, decryptField } from './_crypto'

export const onRequestOptions = () => opts()

async function decryptCreatorRow(row, env) {
  row.contact_number = await decryptField(row.contact_number, env)
  row.email          = await decryptField(row.email, env)
  return row
}

export async function onRequestGet({ env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const { results } = await creatorQ.list(db)
  const mapped = await Promise.all(results.map(row => decryptCreatorRow(row, env).then(mapCreator)))
  return json(mapped)
}

export async function onRequestPost({ request, env }) {
  const db = getDB(env)
  if (!db) return err('DB binding not found', 500)
  const body = await request.json()
  const creator = {
    ...body,
    id:              `c${Date.now()}`,
    coins:           0,
    tasksCompleted:  0,
    joinedDate:      new Date().toISOString().split('T')[0],
    persona:         body.persona ?? {},
    contactNumber:   await encryptField(body.contactNumber   ?? '', env),
    email:           await encryptField(body.email           ?? '', env),
    platformUsername: body.platformUsername ?? '',
    dateOfBirth:     body.dateOfBirth      ?? '',
  }
  await creatorQ.create(db, creator)
  // Return with decrypted values for the frontend
  return json(mapCreator({
    ...creator,
    persona:          JSON.stringify(creator.persona),
    tasks_completed:  0,
    joined_date:      creator.joinedDate,
    avatar_color:     creator.avatarColor,
    contact_number:   body.contactNumber   ?? '',
    email:            body.email           ?? '',
    platform_username: creator.platformUsername,
    date_of_birth:    creator.dateOfBirth,
  }), 201)
}
