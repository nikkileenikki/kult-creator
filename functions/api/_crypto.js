// AES-256-GCM encryption for sensitive creator fields (phone, email)
// Requires ENCRYPTION_KEY env var: a base64-encoded 32-byte key
// If no key is set, values are stored/returned as-is (dev/local fallback)
// Encrypted values are prefixed with "enc:" to distinguish from plaintext

const ALG = { name: 'AES-GCM', length: 256 }

async function importKey(base64Key) {
  const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0))
  return crypto.subtle.importKey('raw', raw, ALG, false, ['encrypt', 'decrypt'])
}

function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer)))
}

export async function encryptField(text, env) {
  if (!text || !env?.ENCRYPTION_KEY) return text ?? ''
  try {
    const key = await importKey(env.ENCRYPTION_KEY)
    const iv  = crypto.getRandomValues(new Uint8Array(12))
    const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(text))
    return `enc:${btoa(String.fromCharCode(...iv))}:${toB64(buf)}`
  } catch {
    return text
  }
}

export async function decryptField(stored, env) {
  if (!stored || !stored.startsWith('enc:') || !env?.ENCRYPTION_KEY) return stored ?? ''
  try {
    const parts = stored.split(':')
    if (parts.length < 3) return stored
    const iv  = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0))
    const ct  = Uint8Array.from(atob(parts[2]), c => c.charCodeAt(0))
    const key = await importKey(env.ENCRYPTION_KEY)
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    return new TextDecoder().decode(buf)
  } catch {
    return stored
  }
}
