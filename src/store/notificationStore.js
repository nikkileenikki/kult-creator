import { create } from 'zustand'
import { fetchNotifications, markNotificationRead } from '@/lib/api/notifications'

export const useNotificationStore = create((set, get) => ({
  mentions: [],
  _timer: null,

  startPolling: (user) => {
    const { _timer } = get()
    if (_timer) clearInterval(_timer)
    get().poll(user)
    const timer = setInterval(() => get().poll(user), 30000)
    set({ _timer: timer })
  },

  stopPolling: () => {
    const { _timer } = get()
    if (_timer) { clearInterval(_timer); set({ _timer: null }) }
  },

  poll: async (user) => {
    try {
      const data = await fetchNotifications(user)
      set({ mentions: data })
    } catch {}
  },

  markRead: async (id) => {
    await markNotificationRead(id)
    set(s => ({ mentions: s.mentions.filter(n => n.id !== id) }))
  },

  markAllRead: async () => {
    const ids = get().mentions.map(n => n.id)
    await Promise.all(ids.map(markNotificationRead))
    set({ mentions: [] })
  },
}))
