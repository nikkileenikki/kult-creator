export const BASE_URL = '/api'
export const USE_MOCK = false

export const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

function toCamel(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
}

function camelizeKeys(val) {
  if (Array.isArray(val)) return val.map(camelizeKeys)
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [toCamel(k), camelizeKeys(v)])
    )
  }
  return val
}

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
    window.location.href = '/'
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody.error ?? `${method} ${path} → ${res.status}`)
  }
  return res.json().then(camelizeKeys)
}
