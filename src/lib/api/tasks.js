// GET    /tasks
// GET    /tasks?creatorId=:id
// POST   /tasks
// PATCH  /tasks/:id/status
// DELETE /tasks/:id

import { delay, USE_MOCK, request } from './index'
import { TASKS } from '../data'

export async function fetchTasks(filters = {}) {
  if (USE_MOCK) {
    await delay()
    let tasks = structuredClone(TASKS)
    if (filters.creatorId) tasks = tasks.filter(t => t.creatorId === filters.creatorId)
    if (filters.status)    tasks = tasks.filter(t => t.status === filters.status)
    if (filters.project)   tasks = tasks.filter(t => t.project === filters.project)
    return tasks
  }
  const params = new URLSearchParams(filters).toString()
  return request('GET', `/tasks${params ? `?${params}` : ''}`)
}

export async function createTask(payload) {
  if (USE_MOCK) {
    await delay(300)
    return { ...payload, id: `t${Date.now()}` }
  }
  return request('POST', '/tasks', payload)
}

export async function updateTaskStatus(taskId, status) {
  if (USE_MOCK) {
    await delay(200)
    return { id: taskId, status }
  }
  return request('PATCH', `/tasks/${taskId}/status`, { status })
}
