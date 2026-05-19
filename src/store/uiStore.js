import { create } from 'zustand'

export const useUIStore = create((set) => ({
  addTaskOpen:       false,
  addTaskPrefill:    null,
  addCreatorOpen:    false,
  addCampaignOpen:   false,
  addBrandOpen:      false,
  editTaskOpen:      false,
  editTaskId:        null,
  notificationsOpen: false,
  dismissedAlerts:   new Set(),
  toast:             null,
  globalSearch:      '',
  sidebarCollapsed:  false,
  currentUser:       localStorage.getItem('ce_current_user') || '',

  openAddTask:         (prefill = null) => set({ addTaskOpen: true, addTaskPrefill: prefill }),
  closeAddTask:        () => set({ addTaskOpen: false, addTaskPrefill: null }),
  openAddCreator:      () => set({ addCreatorOpen: true }),
  closeAddCreator:     () => set({ addCreatorOpen: false }),
  openAddCampaign:     () => set({ addCampaignOpen: true }),
  closeAddCampaign:    () => set({ addCampaignOpen: false }),
  openAddBrand:        () => set({ addBrandOpen: true }),
  closeAddBrand:       () => set({ addBrandOpen: false }),
  openEditTask:        (id) => set({ editTaskOpen: true, editTaskId: id }),
  closeEditTask:       () => set({ editTaskOpen: false, editTaskId: null }),
  toggleNotifications:  () => set(s => ({ notificationsOpen: !s.notificationsOpen })),
  closeNotifications:   () => set({ notificationsOpen: false }),
  dismissAlert:         (id) => set(s => ({ dismissedAlerts: new Set([...s.dismissedAlerts, id]) })),
  dismissAllAlerts:     (ids) => set(s => ({ dismissedAlerts: new Set([...s.dismissedAlerts, ...ids]) })),
  setGlobalSearch:     (q) => set({ globalSearch: q }),
  toggleSidebar:       () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setCurrentUser:      (u) => { localStorage.setItem('ce_current_user', u); set({ currentUser: u }) },

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
