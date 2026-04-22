# Peptora Web App

Next.js 16 PWA — the main user-facing app for peptora.app.

## Stack
- Next.js 16, React 19, Tailwind CSS v4 + CSS custom properties
- DM Sans + DM Mono fonts
- Auth: httpOnly JWT cookies via peptora-api (NOT Supabase directly)
- Deployed on Vercel → https://peptora.app

## Key rules
- All API calls go through `lib/api.js` — never use fetch directly
- Auth state is managed by `lib/auth-context.js` (AuthProvider in layout)
- Device fingerprint: `lib/fingerprint.js` (generates stable SHA-256 hash)
- Pro features wrapped in `components/ProGate.js`
- Always show medical disclaimer on health-tool pages
- Primary colour: #00d68f (teal), background: #1a2535 (navy)

## Structure
- `app/calculator/` — dose calculator (trial-gated, anonymous→free→pro)
- `app/encyclopedia/` — peptide library + [slug] detail pages
- `app/stack-checker/` — AI stack analysis (Pro)
- `app/cycle-tracker/` — daily log + AI summaries (Pro)
- `app/protocol-finder/` — AI goal-based protocols (Pro)
- `app/ai-assistant/` — chat with Claude (Pro)
- `app/vendors/` — vendor trust board
- `app/regulations/` — regulatory tracker
- `app/pricing/` — plan comparison + Stripe checkout
- `app/dashboard/` — user account + history
- `app/auth/` — login, signup, reset-password
- `app/download/` — platform-aware APK/PWA instructions

## Trial system
- Anonymous: 5 uses → signup modal
- Free: 25 total uses → paywall modal  
- Pro: unlimited

## Deploy
```bash
vercel --prod
```
Set env vars in Vercel dashboard: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
