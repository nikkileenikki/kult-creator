// Base config — swap BASE_URL and set USE_MOCK=false to hit real endpoints
export const BASE_URL = '/api/v1'
export const USE_MOCK = true

export const delay = (ms = 400) => new Promise(res => setTimeout(res, ms))

export async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
}
