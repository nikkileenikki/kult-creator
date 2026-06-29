const TOKEN_KEY = 'ce_creator_token'

function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders() {
  const t = getToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export const creatorAuthClient = {
  getToken,

  useSession() {
    // Returns a React-compatible hook result shape: { data, isPending }
    // Actual session state is managed by CreatorPortalShell via useCreatorSession()
    return { data: null, isPending: false }
  },

  async signIn({ email, password }) {
    const res = await fetch('/api/creator-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error ?? 'Invalid email or password')
    setToken(data.token)
    return data
  },

  async getSession() {
    const t = getToken()
    if (!t) return null
    const res = await fetch('/api/creator-auth/session', {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (!res.ok) { removeToken(); return null }
    return res.json()
  },

  async signOut() {
    removeToken()
  },
}

export { authHeaders as creatorAuthHeaders }
