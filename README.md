# CareHub — Multi-Brand Health & Wellness Storefront

CareHub is a multi-brand e-commerce web application selling natural health and
wellness products from **Blackmores**, **GAIA Skin Naturals**, and
**The Little Oak Company** (55 products total).

## Tech stack

- **React 18 + TypeScript + Vite 5** (frontend)
- **Tailwind CSS 3** (styling)
- **React Router 7** (routing)
- **Supabase** (PostgreSQL database + Auth)
- Deployable to **Vercel / Netlify**

## Quick start

```bash
npm install
cp .env.example .env   # fill in your Supabase URL + anon key
npm run dev            # -> http://localhost:5173
```

**The app reads all product data from Supabase.** A fresh database must be set
up first: open `rebuild_all.sql` and run it in your Supabase project's SQL
Editor (see `handover/HANDOVER.md` §5 for the full steps).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

## Documentation

| File | Contents |
|---|---|
| `handover/HANDOVER.md` | Full client handover guide (setup, DB, credentials, checklist) |
| `handover/DEPLOY.md` | Step-by-step Vercel / Netlify deployment |
| `rebuild_all.sql` | Complete database script (schema + all 55 products) |

## Project structure

```
src/                 # React source (components, pages, context, data, lib)
supabase/migrations/ # SQL migration history (archive/original = original schema)
handover/            # Client handover docs
rebuild_all.sql      # Full DB rebuild script
.env.example         # Environment template (never commit .env)
```

## Notes

- Product images hotlink to the brands' public CDNs.
- Online payment is not integrated; checkout records orders.
- See `handover/HANDOVER.md` §8 for the client confirmation checklist.