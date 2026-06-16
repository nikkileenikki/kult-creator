import { create } from 'zustand'
import { request } from '@/lib/api'
import { NICHES } from '@/lib/data'

export const useNicheStore = create((set) => ({
  niches: NICHES.map((name, i) => ({ id: `n${i+1}`, name })),

  fetchNiches: async () => {
    try {
      const data = await request('GET', '/niches')
      if (Array.isArray(data) && data.length) set({ niches: data })
    } catch { /* keep static fallback */ }
  },

  addNiche: async (name) => {
    const niche = await request('POST', '/niches', { name })
    set(s => ({ niches: [...s.niches, niche] }))
    return niche
  },

  deleteNiche: async (id) => {
    await request('DELETE', `/niches/${id}`)
    set(s => ({ niches: s.niches.filter(n => n.id !== id) }))
  },
}))
