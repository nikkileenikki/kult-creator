import { USE_MOCK, delay, request } from './index'

export async function fetchNotifications(user) {
  if (USE_MOCK) { await delay(); return [] }
  return request('GET', `/notifications?user=${encodeURIComponent(user)}`)
}

export async function markNotificationRead(id) {
  if (USE_MOCK) { await delay(100); return { ok: true } }
  return request('PATCH', `/notifications/${id}`, {})
}
