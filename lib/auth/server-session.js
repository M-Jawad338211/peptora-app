import { cache } from 'react'
import { cookies } from 'next/headers'

export const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:8000'

/**
 * Read the session during SSR.
 *
 * This works only because the API is proxied through /api/*: the Set-Cookie
 * comes back on a response from THIS origin, so the browser stores it
 * first-party and sends it here. Talking to the API cross-origin would leave
 * the cookie scoped to the API host, invisible to cookies() and to middleware.
 *
 * Wrapped in React cache() so several Server Components in one render share a
 * single /auth/me round-trip.
 *
 * Returns the UserResponse, or null when signed out. Never throws — an
 * unreachable API should render the signed-out view, not a 500.
 */
export const getSession = cache(async () => {
  const jar = await cookies()
  const token = jar.get('access_token')?.value
  if (!token) return null

  try {
    const res = await fetch(`${API_ORIGIN}/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      cache: 'no-store',
    })
    // 401 = expired (middleware already tried to refresh);
    // 403 = email not verified. Both mean "no usable session here".
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
})
