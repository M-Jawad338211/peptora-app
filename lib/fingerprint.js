'use client'

let cached = null

export async function generateFingerprint() {
  if (cached) return cached
  if (typeof window === 'undefined') return 'ssr'

  const stored = sessionStorage.getItem('_pfp')
  if (stored) {
    cached = stored
    return cached
  }

  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.hardwareConcurrency || 0,
  ].join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(raw)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  sessionStorage.setItem('_pfp', hex)
  cached = hex
  return hex
}
