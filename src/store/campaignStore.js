import { create } from 'zustand'
import { fetchCampaigns, createCampaign, updateCampaign as apiUpdate } from '../lib/api/campaigns'

export const useCampaignStore = create((set) => ({
  campaigns: [],
  loading:   false,
  error:     null,

  fetchCampaigns: async () => {
    set({ loading: true, error: null })
    try {
      const campaigns = await fetchCampaigns()
      set({ campaigns, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addCampaign: async (data) => {
    const c = await createCampaign(data)
    set(s => ({ campaigns: [...s.campaigns, c] }))
    return c
  },

  updateCampaign: async (id, patch) => {
    set(s => ({ campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...patch } : c) }))
    await apiUpdate(id, patch)
  },
}))
