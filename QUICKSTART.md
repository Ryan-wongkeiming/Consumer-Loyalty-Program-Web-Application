# CareHub — Quick Start Guide

Get CareHub running locally in under 5 minutes.

## Prerequisites

- Node.js 18+ (tested on 20.x)
- npm
- A Supabase project (free tier works)

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Set up your database

### Option A: Fresh Supabase project (recommended)

1. Create a project at [supabase.com](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Open `rebuild_all.sql` from this repo
4. Copy the entire file → paste into SQL Editor → **Run**
5. Wait for success

### Option B: Existing Supabase project

Apply migrations in filename order from `supabase/migrations/`. Do NOT run `rebuild_all.sql` on an existing database.

---

## Step 3 — Configure environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and fill in your Supabase values:
   - `VITE_SUPABASE_URL` — your project URL (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` — your anon public key (Project Settings → API)

> ⚠️ Never commit the real `.env` file. It is git-ignored.

---

## Step 4 — Start the dev server

```bash
npm run dev
```

Open `http://localhost:5173/Consumer-Loyalty-Program-Web-Application/` in your browser.

---

## Verify it works

Check these basics:

- [ ] Homepage loads with products
- [ ] Brand filter works (Blackmores / GAIA / Little Oak / HAPPI)
- [ ] Search returns results
- [ ] Product detail page loads with price + SKU
- [ ] Add to cart works
- [ ] Sign up creates an account

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (outputs to dist/) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type-checking |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank/white screen | Check that `.env` has valid Supabase URL and anon key |
| No products showing | Confirm you ran `rebuild_all.sql` or applied migrations, and that the database has data |
| Product photos broken | Images are hosted in Supabase Storage — confirm the bucket exists and policies are set |
| Auth not working | Ensure Email provider is enabled in Supabase → Authentication → Providers |
| Build fails | Confirm Node version is 18+; workflow uses Node 20 |
