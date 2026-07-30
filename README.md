# Peptora Web

Installable PWA for peptide research — dose calculator, protocol tracker and
peptide encyclopedia. Next.js 16 App Router, React 19, Tailwind v4.

Built to match the native app (`../peptora-android`) feature-for-feature while
the store releases are pending. See `CLAUDE.md` for architecture and
conventions.

## Running locally

The web app has no database of its own; it talks to `../peptora-api`.

```bash
# 1. API — needs WEB_URL pointed at localhost, or it issues Secure cookies
#    that the browser drops over http (login appears to work, /auth/me 401s)
cd ../peptora-api
printf 'WEB_URL=http://localhost:3000\nENVIRONMENT=development\n' > .env.local
source venv/bin/activate && uvicorn app.main:app --port 8000

# 2. Web
cd ../peptora-app
printf 'API_ORIGIN=http://localhost:8000\n' > .env.local
npm install
npm run dev
```

Open http://localhost:3000 for the marketing site, or
http://localhost:3000/app/home for the app itself.

### Against a throwaway database

To exercise signup without touching production data:

```bash
docker run -d --name peptora-dev-db \
  -e POSTGRES_PASSWORD=peptora -e POSTGRES_USER=peptora -e POSTGRES_DB=peptora \
  -p 55432:5432 postgres:16-alpine

cd ../peptora-api
DATABASE_URL="postgresql://peptora:peptora@127.0.0.1:55432/peptora" \
  uvicorn app.main:app --port 8000
```

Seed the encyclopedia with
`python scripts/seed_peptides.py ../docs/peptides-json/*.json ../docs/*.json`.
Note the shipped JSON files cross-reference `bpc-157`, which is not among
them, so the relations pass fails until that file exists.

Registration sends a real verification email through Resend, so use an address
you control.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Vitest — calculation engine, formatting, API error shapes |
| `npm run lint` | ESLint |
| `node scripts/gen-icons.mjs` | Regenerate PWA icons (output is committed) |

## Environment

| Variable | Where | Notes |
|---|---|---|
| `API_ORIGIN` | Vercel dashboard / `.env.local` | The FastAPI backend. **Server-only** — the browser only ever calls `/api/*`, which Next proxies. |

## Deploy

```bash
vercel --prod
```

Bump `VERSION` in `public/sw.js` on any deploy that changes the app shell, or
returning users keep the cached one until they hard-reload.
