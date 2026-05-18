// GET    /creators
// GET    /creators/:id
// POST   /creators
// PATCH  /creators/:id
// DELETE /creators/:id

import { delay, USE_MOCK, request } from './index'
import { CREATORS } from '../data'

export async function fetchCreators() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(CREATORS)
  }
  return request('GET', '/creators')
}

export async function fetchCreator(id) {
  if (USE_MOCK) {
    await delay(200)
    const creator = CREATORS.find(c => c.id === id)
    if (!creator) throw new Error(`Creator ${id} not found`)
    return structuredClone(creator)
  }
  return request('GET', `/creators/${id}`)
}

export async function createCreator(payload) {
  if (USE_MOCK) {
    await delay(300)
    return { ...payload, id: `c${Date.now()}`, coins: 0, tasksCompleted: 0, joinedDate: new Date().toISOString().split('T')[0] }
  }
  return request('POST', '/creators', payload)
}

export async function updateCreator(id, patch) {
  if (USE_MOCK) {
    await delay(300)
    return { id, ...patch }
  }
  return request('PATCH', `/creators/${id}`, patch)
}
