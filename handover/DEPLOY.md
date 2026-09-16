# CareHub — Deployment Guide (Vercel / Netlify)

This guide takes the CareHub frontend from local to a **public, permanent URL**
that clients can open on any device.

---

## Before you start

1. You have the project folder (this package).
2. You have a **Supabase project** configured (see HANDOVER.md §5) and know its:
   - `VITE_SUPABASE_URL` (e.g. `https://xxxx.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` (the `anon` public key, starts with `eyJ...`)
3. You have a GitHub account (free).

---

## Step 1 — Push the code to GitHub

```bash
# In the project folder:
git init
git add .
git commit -m "CareHub initial handover"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/carehub.git
git push -u origin main
```

> ⚠️ **Never commit `.env`.** The `.gitignore` already excludes it. Only
> `.env.example` (placeholders) is committed.

---

## Step 2 — Deploy on Vercel (recommended)

1. Go to [vercel.com](https://vercel.com) → **Sign up** (free, GitHub login)
2. **Add New… → Project** → Import your `carehub` GitHub repo
3. Framework preset: **Vite** (auto-detected)
4. **Build Command:** `npm run build`
5. **Output Directory:** `dist`
6. **Environment Variables** — add these two:
   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` (your anon key) |
7. Click **Deploy**
8. Done — you get a URL like `https://carehub-xxxx.vercel.app`

**Every future push to `main` auto-redeploys.**

---

## Step 3 — Deploy on Netlify (alternative)

1. Go to [netlify.com](https://netlify.com) → **Sign up** (free, GitHub login)
2. **Add new site → Import an existing project** → pick the repo
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. **Environment variables** — same two as above
6. Click **Deploy site**
7. Done — URL like `https://carehub-xxxx.netlify.app`

---

## Step 4 — Custom domain (optional)

- **Vercel:** Project → Settings → Domains → add your domain → follow DNS
  instructions (usually an `A` record or `CNAME` at your domain registrar).
- **Netlify:** Domain settings → Add custom domain → follow the DNS steps.
- HTTPS is automatic on both.

---

## Step 5 — Post-deploy verification checklist

After deploying, open the live URL and verify:

- [ ] Homepage loads with all 55 products (Blackmores, GAIA, LittleOak)
- [ ] Product images load (they hotlink to brand CDNs)
- [ ] Brand filter works (LittleOak / GAIA / Blackmores)
- [ ] Category filter works (incl. the 5 baby categories)
- [ ] Search returns results
- [ ] Product detail pages show price + SKU
- [ ] Cart add/remove works
- [ ] Checkout form submits an order (recorded in Supabase)
- [ ] Sign up / sign in works (Supabase Auth)
- [ ] Loyalty page loads

---

## Rollback / re-deploy

- **Vercel:** Deployments tab → pick a previous deployment → **Promote to
  Production**.
- **Netlify:** Deploys tab → **Publish deploy** for any previous one.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| No products on homepage | Supabase env vars missing/wrong | Verify `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in the hosting env; confirm the DB has data |
| Product photos broken | Brand CDN changed URL | Re-host images in Supabase Storage and update product rows |
| Build fails | Node version mismatch | Set Node 20+ in the hosting provider's build settings |
| Auth not working | Supabase Auth not enabled | Enable Email provider in Supabase → Authentication → Providers |
