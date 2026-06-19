import { USE_MOCK, delay, request } from './index'

export async function fetchInternalProjects() {
  if (USE_MOCK) { await delay(); return [] }
  return request('GET', '/internal-projects')
}

export async function createInternalProject(data) {
  if (USE_MOCK) { await delay(300); return { id: `ip${Date.now()}`, ...data } }
  return request('POST', '/internal-projects', data)
}

export async function updateInternalProject(id, data) {
  if (USE_MOCK) { await delay(200); return { id, ...data } }
  return request('PATCH', `/internal-projects/${id}`, data)
}

export async function deleteInternalProject(id) {
  if (USE_MOCK) { await delay(200); return { ok: true } }
  return request('DELETE', `/internal-projects/${id}`)
}

export async function fetchInternalTasks(projectId) {
  if (USE_MOCK) { await delay(); return [] }
  return request('GET', `/internal-tasks?projectId=${projectId}`)
}

export async function createInternalTask(data) {
  if (USE_MOCK) { await delay(300); return { id: `it${Date.now()}`, ...data } }
  return request('POST', '/internal-tasks', data)
}

export async function updateInternalTask(id, data) {
  if (USE_MOCK) { await delay(200); return { id, ...data } }
  return request('PATCH', `/internal-tasks/${id}`, data)
}

export async function deleteInternalTask(id) {
  if (USE_MOCK) { await delay(200); return { ok: true } }
  return request('DELETE', `/internal-tasks/${id}`)
}
