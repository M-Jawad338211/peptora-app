import { cookies } from 'next/headers'
import { API_ORIGIN } from '@/lib/auth/server-session'

/**
 * Server-side fetches for the peptide library.
 *
 * /peptides and /stacks are public reference content: the API serves them to
 * anyone, with no account and no Peptora Pro. The session cookie is still
 * forwarded when there is one, which costs nothing and keeps these calls
 * working unchanged if an endpoint here ever becomes account-scoped. Because
 * a credential may be attached, the response is not cached: the reference
 * tables are small, so `no-store` costs a fast query rather than a page.
 *
 * Anything user-scoped still belongs in the browser client (lib/api/client.js).
 */

async function libraryGet(path) {
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
  return libraryGet('/peptides')
}

/** One peptide by slug id, or null when it does not exist. */
export async function getPeptide(id) {
  try {
    return await libraryGet(`/peptides/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

/** All stacks/blends. Unpaginated by design — the table is small. */
export function getStacks() {
  return libraryGet('/stacks')
}

/** One stack by slug id, or null when it does not exist. */
export async function getStack(id) {
  try {
    return await libraryGet(`/stacks/${encodeURIComponent(id)}`)
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}
