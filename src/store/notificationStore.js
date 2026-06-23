import { create } from 'zustand'
import { fetchNotifications, markNotificationRead } from '@/lib/api/notifications'

export const useNotificationStore = create((set, get) => ({
  mentions: [],
  _timer: null,
  _user: null,

  startPolling: (user) => {
    const { _timer } = get()
    if (_timer) clearInterval(_timer)
    set({ _user: user })
    get().poll(user)
    const timer = setInterval(() => get().poll(user), 10000)
    set({ _timer: timer })

    // Re-poll immediately when the tab becomes visible again
    const onVisible = () => { if (document.visibilityState === 'visible') get().poll(get()._user) }
    document.removeEventListener('visibilitychange', onVisible)
    document.addEventListener('visibilitychange', onVisible)
  },

  stopPolling: () => {
    const { _timer } = get()
    if (_timer) { clearInterval(_timer); set({ _timer: null }) }
  },

  poll: async (user) => {
    if (!user) return
    try {
      const data = await fetchNotifications(user)
      set({ mentions: data })
    } catch {}
  },

  markRead: async (id) => {
    await markNotificationRead(id)
    set(s => ({ mentions: s.mentions.map(n => n.id === id ? { ...n, read: true } : n) }))
  },

  markAllRead: async () => {
    const ids = get().mentions.filter(n => !n.read).map(n => n.id)
    await Promise.all(ids.map(markNotificationRead))
    set(s => ({ mentions: s.mentions.map(n => ({ ...n, read: true })) }))
  },
}))
