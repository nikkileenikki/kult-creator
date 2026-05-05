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
}))
