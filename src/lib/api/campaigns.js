import { USE_MOCK, delay, request } from './index'

const MOCK = [
  { id: 'camp1', name: 'Ramadan Campaign',  description: 'Eid season promotion across social platforms', status: 'Active',    budget: 15000, startDate: '2025-02-15', endDate: '2025-04-05', color: '#6C5CE7' },
  { id: 'camp2', name: 'Brand Launch Q2',   description: 'New product line launch with key creators',     status: 'Active',    budget: 25000, startDate: '2025-04-01', endDate: '2025-06-30', color: '#0891B2' },
  { id: 'camp3', name: 'Skincare Series',   description: 'Ongoing skincare content series',               status: 'Planning',  budget: 8000,  startDate: '2025-05-01', endDate: '2025-07-31', color: '#D97706' },
]

export async function fetchCampaigns() {
  if (USE_MOCK) { await delay(); return MOCK }
  return request('GET', '/campaigns')
}

export async function createCampaign(data) {
  if (USE_MOCK) { await delay(300); return { id: `camp${Date.now()}`, ...data } }
  return request('POST', '/campaigns', data)
}

export async function updateCampaign(id, data) {
  if (USE_MOCK) { await delay(200); return { id, ...data } }
  return request('PATCH', `/campaigns/${id}`, data)
}

export async function deleteCampaign(id) {
  if (USE_MOCK) { await delay(200); return { success: true } }
  return request('DELETE', `/campaigns/${id}`)
}
