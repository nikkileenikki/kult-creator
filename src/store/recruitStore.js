import { create } from 'zustand'
import { fetchRecruits, updateRecruitStatus as apiUpdateStatus } from '../lib/api/recruits'
import { useCreatorStore } from './creatorStore'

export const useRecruitStore = create((set, get) => ({
  requests: [],
  loading:  false,
  error:    null,

  fetchRecruits: async () => {
    set({ loading: true, error: null })
    try {
      const requests = await fetchRecruits()
      set({ requests, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  pendingCount: () =>
    get().requests.filter(r => r.status === 'Pending' || r.status === 'Under Review').length,

  updateStatus: async (id, status) => {
    set(state => ({
      requests: state.requests.map(r => r.id === id ? { ...r, status } : r),
    }))
    await apiUpdateStatus(id, status)
    if (status === 'Approved' || status === 'Rejected') {
      await useCreatorStore.getState().fetchCreators()
    }
  },
}))
