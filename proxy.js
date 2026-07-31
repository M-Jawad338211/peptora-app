import { NextResponse } from 'next/server'
import { secondsUntilExpiry } from '@/lib/auth/jwt'

const API_ORIGIN = process.env.API_ORIGIN || 'http://localhost:8000'

// Refresh this many seconds before actual expiry, so a token doesn't die
// mid-render on a slow response.
const REFRESH_SKEW_SECONDS = 60

/**
 * Keep the access token fresh so SSR always renders a correct session.
 *
 * Server Components can read cookies but cannot set them, so an access token
 * that expires between requests can only be renewed here. Without this, a user
 * returning after 15 minutes would get a signed-out server render and a visible
 * flash once the client caught up.
 *
 * Next 16 calls this file convention "proxy" (formerly "middleware"). It is
 * unrelated to the /api/* rewrite in next.config.mjs, which is also a proxy.
 */
export async function proxy(request) {
  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  // Nothing to refresh with, or the token is still comfortably valid.
  if (!refresh) return NextResponse.next()
  const remaining = access ? secondsUntilExpiry(access) : null
  if (remaining !== null && remaining > REFRESH_SKEW_SECONDS) {
    return NextResponse.next()
  }

  let apiRes
  try {
    apiRes = await fetch(`${API_ORIGIN}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `refresh_token=${refresh}` },
      cache: 'no-store',
    })
  } catch {
    // API unreachable — let the page render signed-out rather than erroring.
    return NextResponse.next()
  }

  if (!apiRes.ok) {
    // The refresh token is dead. Clear both cookies so the app renders a clean
    // signed-out state instead of retrying on every navigation.
    const res = NextResponse.next()
    res.cookies.delete('access_token')
    res.cookies.delete('refresh_token')
    return res
  }

  // Parse the new access token out of the API's Set-Cookie so we can both
  // forward it to the browser and expose it to this same render.
  const setCookie = apiRes.headers.get('set-cookie') || ''
  const newAccess = /access_token=([^;]+)/.exec(setCookie)?.[1]
  if (!newAccess) return NextResponse.next()

  const requestHeaders = new Headers(request.headers)
  const forwarded = request.cookies
    .getAll()
    .map((c) => (c.name === 'access_token' ? `access_token=${newAccess}` : `${c.name}=${c.value}`))
  if (!access) forwarded.push(`access_token=${newAccess}`)
  requestHeaders.set('cookie', forwarded.join('; '))

  const res = NextResponse.next({ request: { headers: requestHeaders } })
  res.cookies.set('access_token', newAccess, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 900,
  })
  return res
}

export const config = {
  // Only the app scope needs a session. Marketing pages, static assets and the
  // /api proxy itself are skipped — proxied calls carry their own cookies and
  // the client has its own refresh-and-replay backstop.
  matcher: ['/app/:path*'],
}
