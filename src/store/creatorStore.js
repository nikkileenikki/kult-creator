import { create } from 'zustand'
import { CREATORS } from '../lib/data'
import { getTier, getNextTier } from '../lib/tierUtils'

export const useCreatorStore = create((set, get) => ({
  creators: CREATORS,

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

  addCreator: (creator) =>
    set(state => ({
      creators: [
        ...state.creators,
        {
          ...creator,
          id: `c${Date.now()}`,
          coins: 0,
          tasksCompleted: 0,
          joinedDate: new Date().toISOString().split('T')[0],
          persona: {
            contentStyle: '',
            toneOfVoice: '',
            brandFitTags: [],
            audienceAgeRange: '',
            audienceGender: '',
            audienceLocations: '',
            engagementStyle: '',
            pastCollabs: [],
            dos: [],
            donts: [],
            internalNotes: '',
          },
        },
      ],
    })),
}))
