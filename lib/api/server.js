import { cookies } from 'next/headers'
import { API_ORIGIN } from '@/lib/auth/server-session'

/**
 * Server-side fetches for the peptide encyclopedia.
 *
 * These used to be uncredentialed and cached for an hour, because /peptides
 * and /stacks were public. They are not any more: the whole app shell is
 * licensed, and both endpoints now return 402 without a live access window.
 *
 * So the session cookie is forwarded, and with a credential in play the
 * response can no longer be cached — a shared cache keyed only by URL would
 * hand one user's authorised response to the next request, which is exactly
 * the paywall bypass the service worker cache was just fixed for. The reference
 * tables are ~16 rows, so `no-store` costs a fast query rather than a page.
 *
 * Anything user-scoped still belongs in the browser client (lib/api/client.js).
 */

async function licensedGet(path) {
  const jar = await cookies()
  const token = jar.get('access_token')?.value

  const res = await fetch(`${API_ORIGIN}${path}`, {
    headers: token ? { Cookie: `access_token=${token}` } : {},
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = new Error(`API ${res.status} for ${path}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/** All peptides. Unpaginated by design — the table is small. */
export function getPeptides() {
  return licensedGet('/peptides')
}

/** One peptide by slug id, or null when it does not exist. */
export async function getPeptide(id) {
  try {
    return await licensedGet(`/peptides/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

/** All stacks/blends. Unpaginated by design — the table is small. */
export function getStacks() {
  return licensedGet('/stacks')
}

/** One stack by slug id, or null when it does not exist. */
export async function getStack(id) {
  try {
    return await licensedGet(`/stacks/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}
