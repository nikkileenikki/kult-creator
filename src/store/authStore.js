import { create } from 'zustand'

function parseToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}

const storedToken = localStorage.getItem('ce_auth_token')
const initialUser = storedToken ? parseToken(storedToken) : null

export const useAuthStore = create((set, get) => ({
  token: initialUser ? storedToken : null,
  user:  initialUser,

  login(token, user) {
    localStorage.setItem('ce_auth_token', token)
    set({ token, user })
  },

  logout() {
    localStorage.removeItem('ce_auth_token')
    set({ token: null, user: null })
  },

  can(permission) {
    return get().user?.permissions?.includes(permission) ?? false
  },

  canViewContacts(creatorPic) {
    const { user } = get()
    if (!user) return false
    if (user.permissions?.includes('contacts.view_all')) return true
    if (user.permissions?.includes('contacts.view_assigned'))
      return user.displayName?.trim().toLowerCase() === creatorPic?.trim().toLowerCase()
    return false
  },
}))
