const DEV_SECRET = 'creator-engine-dev-secret-2026'
const EXPIRY = 7 * 24 * 3600 // 7 days in seconds

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function encObj(obj) {
  return b64url(new TextEncoder().encode(JSON.stringify(obj)))
}

function decB64url(str) {
  return JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')))
}

async function getKey(env) {
  const secret = env?.JWT_SECRET ?? DEV_SECRET
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signJWT(payload, env) {
  const h = encObj({ alg: 'HS256', typ: 'JWT' })
  const b = encObj({ ...payload, exp: Math.floor(Date.now() / 1000) + EXPIRY })
  const key = await getKey(env)
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${h}.${b}`))
  return `${h}.${b}.${b64url(sig)}`
}

export async function verifyJWT(token, env) {
  const parts = token?.split('.')
  if (parts?.length !== 3) return null
  const [h, b, s] = parts
  try {
    const key = await getKey(env)
    const sigBytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(`${h}.${b}`))
    if (!valid) return null
    const payload = decB64url(b)
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch { return null }
}
