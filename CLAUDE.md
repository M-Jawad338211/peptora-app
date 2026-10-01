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

**Never `router.replace()` into a gated route right after a mutation that
changes what the gate sees** (login, consent acceptance, email verification —
anything after which `(shell)/layout.js` or `(open)/layout.js` should now
redirect differently). The Client Router Cache is keyed by URL, and if this
tab visited the target earlier in the same session — which it almost always
has, since that's *how it ended up on the auth/consent screen* —
`router.replace()` can replay the cached `redirect()` from before the
mutation instead of asking the server again. That reads as "stuck on the
same page" or "keeps bouncing back," and it's exactly the shape of bug it
looks like: the mutation genuinely succeeded (a hard reload shows it), only
the soft navigation is lying. The fix used in `login/`, `consent/` and
`verify-email/` is `window.location.href = target` — a real request, so the
gated layout re-reads the actual, current session. Validate anything that
reaches `window.location.href` from a query param first (`lib/safe-next.js`)
— unlike `router.replace()`, it will leave the app for an external origin
with no complaint.

## Key rules
- All API calls go through `lib/api/index.js`; never `fetch` directly.
- Server-side reads of the library use `lib/api/server.js`. `/peptides` and
  `/stacks` are public on the API; the session cookie is still forwarded when
  there is one, so the response is not cached. Anything user-scoped must go
  through the browser client.
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
- Peptora records what the user sets and never suggests an amount. A library
  entry's reported dose ranges are reference reading on its own page, with
  their sources; they are never copied into the calculator or a protocol
  form (`lib/peptideDefaults.js` returns the unit and nothing else).
- The vial and syringe picture (`components/calculator/VialSyringe.js`,
  geometry and its tests in `lib/syringe-geometry.js`) is the same instrument
  the native app draws. It holds no numbers of its own: everything it shows
  comes from props, dragging the plunger only reports units back, and the
  calculator turns those into an amount with `mcg_from_units`. A hold button
  replays the draw through the ref's `setProgress`.
- `components/ui/HoldButton.js` is the press-and-hold control: the draw
  preview in the calculator and "Hold to log" on a protocol. A click does
  nothing; keyboard users hold Space or Enter.
- User-facing copy uses plain punctuation: no em or en dashes, no arrows, no
  trailing ellipses, no emoji. Flat colours, no gradients or glows.
- The support address lives in `lib/site.js`. Do not type it into a page.

## Structure
- `app/(marketing)/` — public site: `/`, `/support`, `/privacy-policy`,
  `/download`. Outside the PWA scope. **The only public surface.**
- `app/app/(shell)/` — PRO-GATED screens in the tab-bar/sidebar chrome:
  protocols (+ `new`, `[id]`) and tracker. Everything a user saves.
- `app/app/(open)/` — same chrome, signed in, NO Pro gate: `home`,
  `encyclopedia` (+ `[slug]`, `stacks`; shown as "Library"), `calculator`,
  `billing`, `profile`.
- `app/app/auth/`, `app/app/consent/` — inside the PWA scope but without
  navigation chrome.
- `components/shell/` — `AppShell`, `TabBar` (<768px), `Sidebar` (≥768px).
- `components/billing/` — paywall, claim form, status timeline, markdown.
- `lib/` — `api/`, `auth/`, `query/`, `reconstitution.js`, `format.js`.
- `proxy.js` — token refresh before render (Next 16 renamed this from
  `middleware.js`).

The admin panel is a **separate app**, `../peptora-admin`, deployed to
admin.peptora.io. It mirrors this app's proxy/cookie architecture and has no
service worker.

## PWA
Scope is `/app/`, `start_url` is `/app/home`, so installing opens the app
rather than the marketing site. `public/sw.js` is hand-rolled: non-GET
requests are never intercepted and **no API response ever enters
CacheStorage**. Bump `VERSION` in that file on any deploy that changes the
shell.

Icons: `node scripts/gen-icons.mjs` (run manually, output committed). Maskable
variants are re-composited at 80% on a background sampled from the artwork —
a plain resize is clipped by Android's circular mask.

## The paywall
**The library and the calculator are free. Peptora Pro is what a user saves:
protocols, the tracker and history.** This is the same split as the native
app, where App Review requires it.

On the web, Pro is a **one-time purchase**, verified by a human. There is no
gateway: the user transfers money, files a claim with a receipt at
`/app/billing`, and an admin approves it in `../peptora-admin`. New accounts
created on the web get a 14-day trial of Pro at email verification, bound to
the signup device.

In the iPhone app, Pro is an **App Store subscription**. An account that has
one arrives here with `access.is_subscription` true and `has_access` true.
The web never sells or cancels that subscription; Billing and Profile only
say that it exists and where it is managed. `TrialBanner` and the Profile
countdown stay quiet for it, because a subscription renews by itself.

`user.access.has_access` comes from the API and is the **only** thing to gate
*feature access* on. Never recompute it from the dates client-side; the two
clocks disagree and a browser running fast would lock out someone whose
licence was approved a moment ago.

**`has_access` is not "owns it."** A live trial satisfies `has_access` too.
`/app/billing` is the one screen where that distinction is load-bearing —
Profile's "Unlock permanently" button sends a trial user there specifically
to buy early, and gating the purchase flow on `has_access` (instead of
`is_lifetime`) turns that into a header claiming "you own this outright"
with no price, no bank details and no way to actually pay. Everywhere else
in the app (`PlanGate`, `Home`, `TrialBanner`) `has_access`
is exactly the right test — those screens ask "can this user use the tool
right now," and a trial answers that the same as a purchase. Only
`components/billing/Billing.js` needs `is_lifetime`, because it is the only
screen asking "does this user need to pay" rather than "can they use this."
Fixed 2026-09-09 — see git history on that file before assuming `hasAccess`
is safe to reach for there again.

- **The gate is structural, not an allowlist.** `(shell)/layout.js` redirects
  unconditionally; anything reachable without Pro lives in `(open)/`.
  Adding a route to the wrong group is the failure mode to watch for — an
  allowlist is one forgotten entry from trapping a user who has just paid.
- The server redirect is UX. The API is the enforcement: protocols, the
  tracker and calculation history all answer 402 without Pro. `/peptides`
  and `/stacks` are public.
- `lib/api/server.js` forwards the session cookie and uses `no-store`.
- `public/sw.js` caches NOTHING under `/api/`. **Bump `VERSION` on any change
  to the shell** — that is what evicts old entries.
- `PlanGate` is defence-in-depth behind the layout redirect, kept for
  client-side navigation and sessions that lapse mid-visit. `CalculatorGate`
  only asks for a signed-in account: the calculator is free, and saving a
  calculation is the Pro part (the Save button is hidden without Pro).
- `TrialBanner` hides itself for `is_lifetime` and `is_subscription`.
- `visibleNavItems()` and `tabItems()` in `lib/nav.js` hide Pro destinations
  from an account without Pro, so the paywall does not show a menu where every
  link bounces back to it.
- Account deletion is on the Profile page (`components/profile/
  DeleteAccount.js`) and calls `POST /auth/delete-account`, the same endpoint
  the native app uses. The privacy policy describes this flow; keep the two
  in step.
- Waiting is the real risk: approval takes hours. `ClaimStatus` polls every
  30s (not 3s — the scale is human), pauses when the tab is hidden, and
  refetches the session on approval because `useSession` caches for 5 minutes.

## Not in this app
No AI features. The `/ai-assistant`, `/stack-checker`, `/protocol-finder`,
`/vendors` and `/regulations` routes were removed and redirect to `/`.

No crypto checkout UI. The NOWPayments rail still exists in the API but is
parked behind `app_settings.crypto_payments_enabled`; `/app/pricing` and its
components were removed and the route redirects to `/app/billing`.

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
