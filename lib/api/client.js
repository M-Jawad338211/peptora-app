/**
 * Browser-side API client.
 *
 * Every request goes to /api/* on this origin, which next.config.mjs rewrites
 * to the FastAPI backend. That indirection is deliberate: it makes the auth
 * cookies first-party, so they are readable in Server Components and
 * middleware, and it takes CORS out of the picture entirely.
 *
 * Server-side callers must NOT use this module — see lib/auth/server-session.js,
 * which talks to API_ORIGIN directly and forwards the cookie itself.
 */

const BASE = '/api'

/**
 * The API returns three different error shapes:
 *   HTTPException      -> {detail: "message"}
 *   Pydantic 422       -> {detail: [{loc, msg, type}, ...]}
 *   rate limit / 500   -> {error: "message"}
 */
function messageFor(status, data) {
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail)) {
    const first = data.detail[0]
    if (first?.msg) {
      // loc is ["body", "<field>"]; naming the field makes an otherwise
      // opaque validation error actionable.
      const field = Array.isArray(first.loc) ? first.loc.at(-1) : null
      return field && typeof field === 'string'
        ? `${field.replace(/_/g, ' ')}: ${first.msg}`
        : first.msg
    }
  }
  if (typeof data?.error === 'string') return data.error
  return `Request failed (${status})`
}

export class ApiError extends Error {
  constructor(status, data) {
    super(messageFor(status, data))
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Endpoints whose 401 is a real answer rather than an expired token.
 * Retrying these after a refresh would be meaningless at best and could
 * resubmit a login at worst.
 */
const NO_REFRESH_RETRY = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
])

function raw(path, { headers, ...rest } = {}) {
  return fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/**
 * Single-flight token refresh.
 *
 * The guard is load-bearing: Home fires several queries at once, and an
 * expired access token would otherwise trigger one refresh per query, all
 * racing to rotate the same cookie.
 *
 * POST /auth/refresh reads the refresh cookie and sets a new access cookie;
 * its body is only {"message": "..."}, so there is nothing to parse — we just
 * check that it succeeded and replay the original request, which now carries
 * the fresh cookie.
 */
let refreshInFlight = null

function refreshOnce() {
  refreshInFlight ??= raw('/auth/refresh', { method: 'POST' })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

async function toError(res) {
  const data = await res.json().catch(() => ({}))
  return new ApiError(res.status, data)
}

export async function apiFetch(path, opts = {}) {
  let res = await raw(path, opts)

  if (res.status === 401 && !NO_REFRESH_RETRY.has(path)) {
    if (await refreshOnce()) res = await raw(path, opts)
  }

  if (!res.ok) throw await toError(res)
  if (res.status === 204) return null
  return res.json()
}

export const get = (path) => apiFetch(path)
export const post = (path, body) =>
  apiFetch(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })
export const patch = (path, body) =>
  apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) })
export const put = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) })
export const del = (path) => apiFetch(path, { method: 'DELETE' })
