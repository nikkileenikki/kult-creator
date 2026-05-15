// GET /analytics/dashboard  — aggregated dashboard metrics + activity feed
// GET /analytics/tiers      — tier distribution snapshot

import { delay, USE_MOCK, request } from './index'
import { CREATORS, TASKS, RECRUIT_REQUESTS, ACTIVITY_FEED } from '../data'
import { getTier } from '../tierUtils'

export async function fetchDashboardMetrics() {
  if (USE_MOCK) {
    await delay(350)
    const active     = CREATORS.filter(c => c.status === 'Active').length
    const dueThisWeek = TASKS.filter(t => t.status !== 'Completed' && t.status !== 'Overdue').length
    const overdue    = TASKS.filter(t => t.status === 'Overdue').length
    const completed  = TASKS.filter(t => t.status === 'Completed').length
    const total      = TASKS.length
    const pendingRecruits = RECRUIT_REQUESTS.filter(r => r.status === 'Pending' || r.status === 'Under Review').length

    return {
      activeCreators:  active,
      dueThisWeek,
      overdue,
      completionRate:  total ? Math.round((completed / total) * 100) : 0,
      pendingRecruits,
    }
  }
  return request('GET', '/analytics/dashboard')
}

export async function fetchTierDistribution() {
  if (USE_MOCK) {
    await delay(250)
    const tiers = ['Platinum', 'Diamond', 'Gold', 'Silver', 'Bronze']
    return tiers.map(name => ({
      name: name.toLowerCase(),
      count: CREATORS.filter(c => getTier(c.coins).name === name).length,
    }))
  }
  return request('GET', '/analytics/tiers')
}

export async function fetchActivityFeed() {
  if (USE_MOCK) {
    await delay(200)
    return structuredClone(ACTIVITY_FEED)
  }
  return request('GET', '/analytics/activity')
}
