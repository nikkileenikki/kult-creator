// GET    /recruits
// PATCH  /recruits/:id/status
// POST   /recruits

import { delay, USE_MOCK, request } from './index'
import { RECRUIT_REQUESTS } from '../data'

export async function fetchRecruits() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(RECRUIT_REQUESTS)
  }
  return request('GET', '/recruits')
}

export async function updateRecruitStatus(id, payload) {
  if (USE_MOCK) {
    await delay(200)
    return { id, ...payload }
  }
  return request('PATCH', `/recruits/${id}/status`, payload)
}
