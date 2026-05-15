import { create } from 'zustand'
import { getTier } from '../lib/tierUtils'
import { fetchCreators, createCreator } from '../lib/api/creators'

export const useCreatorStore = create((set, get) => ({
  creators: [],
  loading: false,
  error: null,

  fetchCreators: async () => {
    set({ loading: true, error: null })
    try {
      const creators = await fetchCreators()
      set({ creators, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  awardCoins: (creatorId, amount) => {
    set(state => {
      const creators = state.creators.map(c => {
        if (c.id !== creatorId) return c
        const oldTier = getTier(c.coins)
        const newCoins = c.coins + amount
        const newTier = getTier(newCoins)
        const leveledUp = newTier.name !== oldTier.name
        return { ...c, coins: newCoins, _leveledUp: leveledUp ? newTier.name : null }
      })
      return { creators }
    })
  },

  getCreatorById: (id) => get().creators.find(c => c.id === id),

  addCreator: async (creator) => {
    const newCreator = await createCreator({
      ...creator,
      persona: {
        contentStyle: '', toneOfVoice: '', brandFitTags: [],
        audienceAgeRange: '', audienceGender: '', audienceLocations: '',
        engagementStyle: '', pastCollabs: [], dos: [], donts: '', internalNotes: '',
      },
    })
    set(state => ({ creators: [...state.creators, newCreator] }))
    return newCreator
  },
}))
