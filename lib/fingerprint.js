'use client'

const STORAGE_KEY = '_pfp'

let cached = null

/**
 * Stable per-device identifier used for anonymous calculator trial limits.
 *
 * Stored in localStorage, not sessionStorage: in an installed PWA a
 * per-session value would reset the anonymous allowance on every launch and
 * leave orphaned TrialCounter rows behind.
 *
 * When crypto.subtle is unavailable — it requires a secure context, so any
 * plain-http origin that is not localhost — we emit a `fallback-fp-` prefixed
 * value. The API special-cases that prefix (peptora-api/app/routers/auth.py:96)
 * and starts the user on a fresh counter rather than claiming a shared one.
 */
export async function generateFingerprint() {
  if (cached) return cached
  if (typeof window === 'undefined') return 'ssr'

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      cached = stored
      return cached
    }
  } catch {
    // Storage can throw in private mode; fall through and recompute.
  }

  let value
  try {
    const raw = [
      navigator.userAgent,
      screen.width,
      screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
      navigator.hardwareConcurrency || 0,
    ].join('|')

    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(raw)
    )
    value = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch {
    // Random, not constant: a shared constant would put every such device in
    // one trial bucket. Native returns a fixed 'fallback-fp-android' and every
    // Android device collides on it.
    value = `fallback-fp-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`
  }

  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Non-fatal — the value stays in the module-level cache for this session.
  }
  cached = value
  return value
}
