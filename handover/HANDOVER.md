# CareHub — Client Handover Guide

**Project:** CareHub — multi-brand natural health & wellness storefront
**Date:** 2026-09-16
**Version:** 1.0 (ready for client confirmation)

---

## 1. What this is

CareHub is a **multi-brand e-commerce web application** selling natural health
and wellness products from three brands:

| Brand | Products | Category focus |
|---|---|---|
| **Blackmores** | 18 | Vitamins, minerals, fish oil, infant formula |
| **GAIA Skin Naturals** | 19 | Baby bath, skin, hair, oral care |
| **The Little Oak Company** | 18 | Goat milk infant formula (cans, sachets, combos) |

**Total: 55 products**, with categories, brand filtering, search, cart, checkout,
loyalty points, free samples, wishlist, and user accounts.

---

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 7 |
| Icons | lucide-react |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Hosting (recommended) | Vercel or Netlify |

---

## 3. Project structure

```
Consumer-Loyalty-Program-Web-Application-main/
├── src/                      # React source code
│   ├── components/           # Header, ProductCard, CartSidebar, etc.
│   ├── pages/                # Home, Product, Checkout, Loyalty, etc.
│   ├── context/              # Auth + Cart state
│   ├── data/                 # Product/article/topic data access
│   └── lib/                  # Supabase client
├── supabase/
│   ├── migrations/           # SQL migrations (database history)
│   │   ├── archive/original/ # Original schema (already applied)
│   │   └── 20260916*.sql     # CareHub changes (rebrand, multi-brand)
├── rebuild_all.sql           # FULL database script (schema + all 55 products)
├── .env.example              # Environment template (fill in real values)
└── package.json
```

---

## 4. Local development setup

**Prerequisites:** Node.js 18+ (tested on 24.x), npm.

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
#    Copy .env.example to .env and fill in your Supabase values:
#    VITE_SUPABASE_URL=...
#    VITE_SUPABASE_ANON_KEY=...

# 3. Start the dev server
npm run dev
# -> http://localhost:5173
```

**Other useful commands:**

```bash
npm run build    # production build (outputs to dist/)
npm run preview  # preview the production build locally
npm run lint     # lint check
```

---

## 5. Database setup (SUPABASE — IMPORTANT)

The app is a **frontend + Supabase backend**. The frontend reads ALL product
data from Supabase. **Without a configured Supabase database, the site shows
no products.**

### Option A — New Supabase project (recommended for handover)

1. Create a free project at [supabase.com](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Open `rebuild_all.sql` from this package
4. Copy the **entire file** → paste → **Run**
5. Wait for success. This creates the full schema + seeds all 55 products.
6. Go to **Project Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public key` → `VITE_SUPABASE_ANON_KEY`
7. Put those into `.env` (and into the hosting provider's env vars, see §6)

### Option B — Use an existing Supabase project

If reusing an existing database, do **NOT** run `rebuild_all.sql` (it assumes a
fresh DB). Instead run only the `20260916*.sql` migrations in the
`supabase/migrations/` folder, in filename order (oldest first).

---

## 6. Deployment (making it live)

See **DEPLOY.md** in this folder for the full step-by-step (Vercel and Netlify).

**TL;DR:**

| Step | Action |
|---|---|
| 1 | Push code to GitHub |
| 2 | Import repo into Vercel or Netlify |
| 3 | Build: `npm run build`, output: `dist` |
| 4 | Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| 5 | Deploy → get public URL |

---

## 7. Credentials & ownership

> ⚠️ **Read this before handover.**

- The **`.env` file is NEVER committed or shared** — it contains secrets.
  The repo only ships `.env.example` with placeholders.
- **The client should own their own Supabase project** (Option A above) so the
  app's data and credentials belong to them.
- Product images hotlink to the brands' public CDNs (GAIA / LittleOak /
  Blackmores). If a brand changes an image URL, that product's photo breaks —
  the fix is to download and host the image yourself in Supabase Storage.

---

## 8. Client confirmation checklist

Before shipping, confirm with the client:

- [ ] Brand names correct (CareHub store; Blackmores / GAIA / LittleOak products)
- [ ] Product catalog correct (55 products, prices, combos, SKUs)
- [ ] Brand filter, category filter, search all work
- [ ] Loyalty program / free samples flow works
- [ ] Checkout + payment flow confirmed (payment provider not yet integrated —
      checkout currently records orders; online payment needs a gateway like
      Stripe, configured separately)
- [ ] Language: Vietnamese UI confirmed
- [ ] Custom domain (if any) provided by client

---

## 9. Known notes / pending items

| Item | Status |
|---|---|
| Migration `20260916000006_carehub_ship_readiness.sql` | PENDING on the developer's Supabase — run it to fix products 3 & 7 (placeholder images + category) |
| Online payment gateway (Stripe etc.) | NOT integrated — checkout stores the order but does not charge |
| Product images | Hotlinked from brand CDNs (see §7 caveat) |
| SEO / analytics | Not configured |

---

*Prepared for client handover. For support, contact the development team with
this document + the DEPLOY.md guide.*