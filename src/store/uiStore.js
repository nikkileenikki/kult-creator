import { create } from 'zustand'

export const useUIStore = create((set) => ({
  addTaskOpen: false,
  addCreatorOpen: false,
  toast: null,

  openAddTask: () => set({ addTaskOpen: true }),
  closeAddTask: () => set({ addTaskOpen: false }),
  openAddCreator: () => set({ addCreatorOpen: true }),
  closeAddCreator: () => set({ addCreatorOpen: false }),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
