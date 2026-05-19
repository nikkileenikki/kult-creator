import { create } from 'zustand'
import { getTier } from '../lib/tierUtils'
import { fetchCreators, createCreator, updateCreator as apiUpdateCreator } from '../lib/api/creators'

export const useCreatorStore = create((set, get) => ({
  creators: [],
  loading:  false,
  error:    null,

  fetchCreators: async () => {
    set({ loading: true, error: null })
    try {
      const creators = await fetchCreators()
      set({ creators, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  awardCoins: async (creatorId, amount) => {
    const creator = get().creators.find(c => c.id === creatorId)
    if (!creator) return
    const oldTier           = getTier(creator.coins)
    const newCoins          = creator.coins + amount
    const newTier           = getTier(newCoins)
    const leveledUp         = newTier.name !== oldTier.name
    const newTasksCompleted = (creator.tasksCompleted ?? 0) + 1
    set(state => ({
      creators: state.creators.map(c =>
        c.id === creatorId ? { ...c, coins: newCoins, tasksCompleted: newTasksCompleted, _leveledUp: leveledUp ? newTier.name : null } : c
      ),
    }))
    await apiUpdateCreator(creatorId, { coins: newCoins, tasksCompleted: newTasksCompleted })
  },

  updateCreator: async (id, patch) => {
    set(state => ({
      creators: state.creators.map(c => c.id === id ? { ...c, ...patch } : c),
    }))
    await apiUpdateCreator(id, patch)
  },

  getCreatorById: (id) => get().creators.find(c => c.id === id),

  addCreator: async (creator) => {
    const newCreator = await createCreator({
      ...creator,
      persona: {
        contentStyle: '', toneOfVoice: '', brandFitTags: [],
        audienceAgeRange: '', audienceGender: '', audienceLocations: '',
        engagementStyle: '', pastCollabs: [], dos: [], donts: [], internalNotes: '',
      },
    })
    set(state => ({ creators: [...state.creators, newCreator] }))
    return newCreator
  },
}))
