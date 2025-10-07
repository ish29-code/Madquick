export const textEncoder = new TextEncoder()
export const textDecoder = new TextDecoder()
function toBase64(buf: ArrayBuffer) { return Buffer.from(new Uint8Array(buf)).toString('base64') }
function fromBase64(s: string) { return Uint8Array.from(Buffer.from(s,'base64')).buffer }
export async function generateSalt(len = 16) { return toBase64(crypto.getRandomValues(new Uint8Array(len)).buffer) }
export async function deriveKey(password: string, saltBase64: string, iterations = 200000) {
  const salt = fromBase64(saltBase64)
  const pwKey = await crypto.subtle.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, pwKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt','decrypt'])
  return key
}
export async function encryptData(key: CryptoKey, data: object) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const pt = textEncoder.encode(JSON.stringify(data))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt)
  return { iv: toBase64(iv.buffer), ciphertext: toBase64(ct) }
}
export async function decryptData(key: CryptoKey, ivBase64: string, ciphertextBase64: string) {
  const iv = fromBase64(ivBase64); const ct = fromBase64(ciphertextBase64)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return JSON.parse(textDecoder.decode(pt))
}
