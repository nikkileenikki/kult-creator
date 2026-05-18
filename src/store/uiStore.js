import { create } from 'zustand'

export const useUIStore = create((set) => ({
  addTaskOpen:     false,
  addCreatorOpen:  false,
  addCampaignOpen: false,
  editTaskOpen:    false,
  editTaskId:      null,
  toast:           null,

  openAddTask:      () => set({ addTaskOpen: true }),
  closeAddTask:     () => set({ addTaskOpen: false }),
  openAddCreator:   () => set({ addCreatorOpen: true }),
  closeAddCreator:  () => set({ addCreatorOpen: false }),
  openAddCampaign:  () => set({ addCampaignOpen: true }),
  closeAddCampaign: () => set({ addCampaignOpen: false }),
  openEditTask:     (id) => set({ editTaskOpen: true, editTaskId: id }),
  closeEditTask:    () => set({ editTaskOpen: false, editTaskId: null }),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
