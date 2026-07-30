# Peptora Web App

Next.js 16 installable PWA — the user-facing app for peptora.io. Built to
match the native app (`../peptora-android`) feature-for-feature while the
store releases are pending.

## Stack
- Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4
- `@tanstack/react-query` v5 for client data, seeded from the server session
- DM Sans + DM Mono via `next/font`
- Auth: httpOnly JWT cookies issued by `../peptora-api`
- Deployed on Vercel → https://peptora.io

## Architecture

**The API is proxied.** `next.config.mjs` rewrites `/api/*` to `API_ORIGIN`.
The browser never calls the API directly. This is load-bearing:
- Cookies come back on a response from *this* origin, so they are
  first-party and readable by Server Components and `proxy.js`. Talking to
  the API cross-origin leaves them scoped to the API host, invisible to
  `cookies()`.
- CORS never applies — browser→Next is same-origin, Next→API is
  server-to-server.
- Because everything is same-origin, the service worker would intercept
  authenticated traffic by default. `public/sw.js` explicitly excludes it.

**Session is read on the server.** `app/app/layout.js` calls `getSession()`
and seeds the react-query cache, so the first paint already knows the user —
no logged-out flash. `proxy.js` refreshes an expiring access token *before*
render, since Server Components can read cookies but cannot set them.
`lib/api/client.js` keeps a single-flight refresh-and-replay as a backstop
for long-lived tabs.

## Key rules
- All API calls go through `lib/api/index.js`; never `fetch` directly.
- Server-side reads of public data use `lib/api/server.js` (cached). Anything
  user-scoped must go through the browser client so it is never cached
  across users.
- Mutations must follow the invalidation matrix — deleting a protocol
  cascade-deletes its dose logs, so it invalidates the tracker feed too.
- `target_dose_mcg` is always micrograms; `unit` is display-only. Render via
  `formatDoseFromMcg()` or a 5 mg dose shows as "5000 mg".
- `text-tx3` is for decorative sub-12px chrome only (3.06:1). Anything
  carrying a sentence uses `text-tx3-body`. Same split for
  `text-danger` (icons/borders) vs `text-danger-text` (copy).
- Calculation logic lives in `lib/reconstitution.js`, ported verbatim from
  native and covered by tests. Build the display object with `build_result`,
  never inline.
- Always show the medical disclaimer on dosing surfaces.

## Structure
- `app/(marketing)/` — public site: `/`, `/support`, `/privacy-policy`,
  `/download`. Outside the PWA scope.
- `app/app/(shell)/` — product screens wrapped in the tab-bar/sidebar chrome:
  home, encyclopedia (+ `[slug]`), protocols (+ `new`, `[id]`), calculator,
  tracker, profile.
- `app/app/auth/`, `app/app/consent/` — inside the PWA scope but without
  navigation chrome.
- `components/shell/` — `AppShell`, `TabBar` (<768px), `Sidebar` (≥768px).
- `lib/` — `api/`, `auth/`, `query/`, `reconstitution.js`, `format.js`.
- `proxy.js` — token refresh before render (Next 16 renamed this from
  `middleware.js`).

## PWA
Scope is `/app/`, `start_url` is `/app/home`, so installing opens the app
rather than the marketing site. `public/sw.js` is hand-rolled: non-GET
requests are never intercepted, `/api/peptides*` is stale-while-revalidate,
and no other API response ever enters CacheStorage. Bump `VERSION` in that
file on any deploy that changes the shell.

Icons: `node scripts/gen-icons.mjs` (run manually, output committed). Maskable
variants are re-composited at 80% on a background sampled from the artwork —
a plain resize is clipped by Android's circular mask.

## Not in this app
No AI features, no payments, no pro gating — everything is free. The
`/ai-assistant`, `/stack-checker`, `/protocol-finder`, `/vendors`,
`/regulations` and `/pricing` routes were removed and redirect to `/`.

## Local dev
```bash
npm run dev     # .env.local: API_ORIGIN=http://localhost:8000
npm test        # vitest — reconstitution engine, formatting, api errors
npm run lint
```
The API needs `WEB_URL=http://localhost:3000` in `peptora-api/.env.local`, or
it issues `Secure` cookies that the browser silently drops over http and
login appears to succeed while `/auth/me` 401s forever.

## Deploy
```bash
vercel --prod
```
Set `API_ORIGIN` in the Vercel dashboard. It is server-only — no
`NEXT_PUBLIC_` prefix, since the browser only ever calls `/api/*`.
