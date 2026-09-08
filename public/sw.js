/**
 * Peptora service worker.
 *
 * Hand-rolled rather than generated. next-pwa is unmaintained, and
 * @serwist/next injects through a webpack plugin while Next 16 builds with
 * Turbopack by default. The actual requirement is small: an offline shell,
 * and — most importantly — a guarantee that no authenticated, paid or health
 * data is ever written to CacheStorage.
 *
 * Bump VERSION on any deploy that changes the shell; `activate` purges every
 * cache that does not carry the current version.
 */
// v3 drops the encyclopedia cache. /api/peptides and /api/stacks used to be
// unauthenticated and were cached stale-while-revalidate; they now sit behind
// the licence gate, and a cached copy would keep serving the encyclopedia to a
// lapsed user straight out of CacheStorage — a paywall bypass for anyone who
// had visited before. The version bump is what evicts those existing entries.
const VERSION = 'v3'
const SHELL_CACHE = `peptora-shell-${VERSION}`
const STATIC_CACHE = `peptora-static-${VERSION}`
const CURRENT = [SHELL_CACHE, STATIC_CACHE]

const OFFLINE_URL = '/app/offline'
const PRECACHE = [OFFLINE_URL, '/icons/icon-192.png']

const API_PREFIX = '/api/'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !CURRENT.includes(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Never touch mutations. Intercepting a POST/PATCH/DELETE risks replaying
  // or masking a dose write, which must always reach the server or fail loudly.
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Nothing under /api is ever cached. Every endpoint is now either
  // authenticated or licence-gated, so a cached response is a response served
  // to someone who may no longer be entitled to it.
  if (url.pathname.startsWith(API_PREFIX)) return

  if (request.mode === 'navigate') {
    event.respondWith(navigationHandler(request))
    return
  }

  // Content-hashed build output and icons are immutable.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
  }
})

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) cache.put(request, res.clone())
  return res
}

async function navigationHandler(request) {
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    const cache = await caches.open(SHELL_CACHE)
    // Prefer this exact page if it was visited before, then the offline shell.
    return (await cache.match(request)) ?? (await cache.match(OFFLINE_URL)) ?? Response.error()
  }
}
