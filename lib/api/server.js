import { API_ORIGIN } from '@/lib/auth/server-session'

/**
 * Server-side fetches for the PUBLIC peptide endpoints.
 *
 * These carry no credentials, so they can be cached and revalidated — which
 * is what lets the encyclopedia render as static HTML with fast first paint
 * and real SEO. Anything user-scoped must go through the browser client
 * (lib/api/client.js) instead, so it is never cached across users.
 */

const REVALIDATE_SECONDS = 3600

async function publicGet(path) {
  const res = await fetch(`${API_ORIGIN}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
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
  return publicGet('/peptides')
}

/** One peptide by slug id, or null when it does not exist. */
export async function getPeptide(id) {
  try {
    return await publicGet(`/peptides/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

/** All stacks/blends. Unpaginated by design — the table is small. */
export function getStacks() {
  return publicGet('/stacks')
}

/** One stack by slug id, or null when it does not exist. */
export async function getStack(id) {
  try {
    return await publicGet(`/stacks/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}
