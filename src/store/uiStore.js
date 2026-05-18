import { create } from 'zustand'

export const useUIStore = create((set) => ({
  addTaskOpen:       false,
  addTaskPrefill:    null,
  addCreatorOpen:    false,
  addCampaignOpen:   false,
  editTaskOpen:      false,
  editTaskId:        null,
  notificationsOpen: false,
  toast:             null,
  globalSearch:      '',
  sidebarCollapsed:  false,

  openAddTask:         (prefill = null) => set({ addTaskOpen: true, addTaskPrefill: prefill }),
  closeAddTask:        () => set({ addTaskOpen: false, addTaskPrefill: null }),
  openAddCreator:      () => set({ addCreatorOpen: true }),
  closeAddCreator:     () => set({ addCreatorOpen: false }),
  openAddCampaign:     () => set({ addCampaignOpen: true }),
  closeAddCampaign:    () => set({ addCampaignOpen: false }),
  openEditTask:        (id) => set({ editTaskOpen: true, editTaskId: id }),
  closeEditTask:       () => set({ editTaskOpen: false, editTaskId: null }),
  toggleNotifications: () => set(s => ({ notificationsOpen: !s.notificationsOpen })),
  closeNotifications:  () => set({ notificationsOpen: false }),
  setGlobalSearch:     (q) => set({ globalSearch: q }),
  toggleSidebar:       () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
