// AES-256-GCM encryption for sensitive creator fields (phone, email)
// ENCRYPTION_KEY env var: any passphrase/phrase — PBKDF2 derives the actual key
// If no key is set, values are stored/returned as-is (dev/local fallback)
// Encrypted values are prefixed with "enc:" to distinguish from plaintext

const ALG  = { name: 'AES-GCM', length: 256 }
const SALT = new TextEncoder().encode('creator-engine-v1') // fixed app salt for key derivation

async function deriveKey(passphrase) {
  const raw = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: SALT, iterations: 100_000, hash: 'SHA-256' },
    raw,
    ALG,
    false,
    ['encrypt', 'decrypt'],
  )
}

function toB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf instanceof ArrayBuffer ? buf : buf.buffer)))
}

export async function encryptField(text, env) {
  if (!text || !env?.ENCRYPTION_KEY) return text ?? ''
  try {
    const key = await deriveKey(env.ENCRYPTION_KEY)
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
    const key = await deriveKey(env.ENCRYPTION_KEY)
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
    return new TextDecoder().decode(buf)
  } catch {
    return stored
  }
}
