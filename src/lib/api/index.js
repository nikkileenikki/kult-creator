export const BASE_URL = '/api'
export const USE_MOCK = false

export const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export async function request(method, path, body) {
  const token = localStorage.getItem('ce_auth_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('ce_auth_token')
    window.location.reload()
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody.error ?? `${method} ${path} → ${res.status}`)
  }
  return res.json()
}
