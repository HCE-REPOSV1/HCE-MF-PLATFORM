export interface EncryptedPayload {
  iv: string
  tag: string
  ciphertext: string
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buf   = new ArrayBuffer(hex.length / 2)
  const bytes = new Uint8Array(buf)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64)
  const buf    = new ArrayBuffer(binary.length)
  const bytes  = new Uint8Array(buf)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function decryptAesGcm(payload: EncryptedPayload, keyHex: string): Promise<unknown> {
  const keyBytes   = hexToBytes(keyHex)
  const iv         = hexToBytes(payload.iv)
  const tag        = hexToBytes(payload.tag)
  const ciphertext = base64ToBytes(payload.ciphertext)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt'],
  )

  // Web Crypto API requires ciphertext + auth tag concatenated (unlike Node's setAuthTag)
  const combinedBuf = new ArrayBuffer(ciphertext.length + tag.length)
  const combined    = new Uint8Array(combinedBuf)
  combined.set(ciphertext)
  combined.set(tag, ciphertext.length)

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    combined,
  )

  return JSON.parse(new TextDecoder().decode(plaintext)) as unknown
}
