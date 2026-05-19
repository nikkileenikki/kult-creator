import { create } from 'zustand'
import { fetchBrands, createBrand, updateBrand as apiUpdate } from '../lib/api/brands'

export const useBrandStore = create((set) => ({
  brands:  [],
  loading: false,
  error:   null,

  fetchBrands: async () => {
    set({ loading: true, error: null })
    try {
      const brands = await fetchBrands()
      set({ brands, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  addBrand: async (data) => {
    const brand = await createBrand(data)
    set(s => ({ brands: [...s.brands, brand] }))
    return brand
  },

  updateBrand: async (id, patch) => {
    set(s => ({ brands: s.brands.map(b => b.id === id ? { ...b, ...patch } : b) }))
    await apiUpdate(id, patch)
  },
}))
