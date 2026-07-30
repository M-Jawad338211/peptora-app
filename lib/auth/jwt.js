/**
 * Read `exp` out of a JWT without verifying the signature.
 *
 * Verification is the API's job and requires JWT_SECRET, which this app
 * deliberately does not hold. We only need to decide whether a refresh is
 * worth attempting; a forged token simply fails at the API.
 *
 * @returns seconds until expiry, or null if the token is unreadable or has no
 *          numeric `exp` — callers should treat null as "assume expired".
 */
export function secondsUntilExpiry(token, now = Date.now()) {
  if (typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  try {
    // JWT uses base64url; atob needs plain base64.
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary')
    const payload = JSON.parse(json)
    if (typeof payload.exp !== 'number') return null
    return payload.exp - Math.floor(now / 1000)
  } catch {
    return null
  }
}
