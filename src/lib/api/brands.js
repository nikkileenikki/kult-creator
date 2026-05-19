import { delay, USE_MOCK, request } from './index'
import { BRANDS } from '../data'

export async function fetchBrands() {
  if (USE_MOCK) {
    await delay()
    return structuredClone(BRANDS)
  }
  return request('GET', '/brands')
}

export async function createBrand(payload) {
  if (USE_MOCK) {
    await delay(300)
    return { ...payload, id: `brand${Date.now()}` }
  }
  return request('POST', '/brands', payload)
}

export async function updateBrand(id, patch) {
  if (USE_MOCK) {
    await delay(300)
    return { id, ...patch }
  }
  return request('PATCH', `/brands/${id}`, patch)
}
