import { create } from 'zustand'
import { RECRUIT_REQUESTS } from '../lib/data'

export const useRecruitStore = create((set, get) => ({
  requests: RECRUIT_REQUESTS,

  pendingCount: () =>
    get().requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length,

  updateStatus: (id, status) =>
    set(state => ({
      requests: state.requests.map(r => r.id === id ? { ...r, status } : r),
    })),
}))
