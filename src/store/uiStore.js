import { create } from 'zustand'

function loadDismissed() {
  try { return new Set(JSON.parse(localStorage.getItem('ce_dismissed_alerts') ?? '[]')) }
  catch { return new Set() }
}

function saveDismissed(s) {
  try { localStorage.setItem('ce_dismissed_alerts', JSON.stringify([...s])) } catch {}
}

export const useUIStore = create((set) => ({
  addTaskOpen:       false,
  addTaskPrefill:    null,
  addCreatorOpen:    false,
  addCampaignOpen:   false,
  addBrandOpen:      false,
  editTaskOpen:      false,
  editTaskId:        null,
  notificationsOpen: false,
  dismissedAlerts:   loadDismissed(),
  toast:             null,
  globalSearch:      '',
  sidebarCollapsed:  false,

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
  dismissAlert: (id) => set(s => {
    const next = new Set([...s.dismissedAlerts, id])
    saveDismissed(next)
    return { dismissedAlerts: next }
  }),
  dismissAllAlerts: (ids) => set(s => {
    const next = new Set([...s.dismissedAlerts, ...ids])
    saveDismissed(next)
    return { dismissedAlerts: next }
  }),
  setGlobalSearch:     (q) => set({ globalSearch: q }),
  toggleSidebar:       () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  showToast: (message, type = 'success') => {
    set({ toast: { message, type } })
    setTimeout(() => set({ toast: null }), 3000)
  },
}))
