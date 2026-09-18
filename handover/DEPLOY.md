# CareHub — Deployment Guide (GitHub Pages via GitHub Actions)

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

## How deployment works (important)

- The site is hosted on **GitHub Pages** and built by the **GitHub Actions
  workflow** (`.github/workflows/deploy.yml`).
- Every push to `main` triggers the workflow: it runs `npm ci` → `npm run build`
  → deploys `dist/` to Pages.
- The workflow gets Supabase config from **one of two sources**, in priority order:
  1. **Repo secrets** `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
     (GitHub → repo → Settings → Secrets and variables → Actions), OR
  2. **`.env.production`** (committed public config — used automatically when
     the secrets are empty).
- The Supabase **anon key is public by design** (it ships inside every client
  bundle); your data is protected by Row Level Security (RLS), never by this
  key. The `service_role` key must never be committed or exposed.

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

> ⚠️ **Never commit the real `.env`** (it is git-ignored). `.env.example`
> (placeholders) and `.env.production` (public anon config) are committed.

---

## Step 2 — One-time GitHub setup

1. Go to your repo → **Settings → Pages** → under "Build and deployment":
   **Source: GitHub Actions** (already configured via the workflow file).
2. **Optional but recommended** — set repo secrets so builds use secrets
   instead of the committed fallback:
   - `VITE_SUPABASE_URL` → your URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
3. Wait ~2 minutes for the first build to deploy. The live URL is:
   `https://<your-user>.github.io/<repo-name>/`

---

## Step 3 — Re-deploy / force a rebuild

If the live site looks stale (CDN caching an old bundle), push an empty commit:

```bash
git commit --allow-empty -m "chore: force Pages redeploy"
git push origin main
```

---

## Step 4 — Custom domain (optional)

1. Repo → **Settings → Pages → Custom domain** → add your domain.
2. Add the DNS record GitHub shows you (usually an `A` record or `CNAME` at
   your domain registrar).
3. HTTPS is automatic.

---

## Step 5 — Post-deploy verification checklist

After deploying, open the live URL and verify:

- [ ] Homepage loads with all products (Blackmores, GAIA, LittleOak, HAPPI Health)
- [ ] Product images load (they hotlink to brand CDNs)
- [ ] Brand filter works (LittleOak / HAPPI / GAIA / Blackmores)
- [ ] Category filter works (incl. the baby categories)
- [ ] Search returns results
- [ ] Product detail pages show price + SKU
- [ ] Cart add/remove works
- [ ] Checkout form submits an order (recorded in Supabase)
- [ ] Sign up / sign in works (Supabase Auth)
- [ ] Subscription pages work (Đăng ký &amp; Tiết kiệm, FAQ, Điều Khoản)
- [ ] Sold-out products show "Hết hàng"

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|----|
| **Blank/white screen after deploy** | CI built with empty Supabase config | Workflow falls back to `.env.production` automatically; verify `.env.production exists; if the bundle still lacks `supabase.co`, re-push an empty commit to force redeploy |
| No products on homepage | Supabase env vars missing/wrong | Confirm `.env.production` (or repo secrets) has `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`; confirm the DB has data |
| Product photos broken | Brand CDN changed URL | Re-host images in Supabase Storage and update product rows |
| Build fails | Node version mismatch | Workflow uses Node 20 (set in `.github/workflows/deploy.yml`) |
| Auth not working | Supabase Auth not enabled | Enable Email provider in Supabase → Authentication → Providers |
| Page references old bundle that 404s | CDN cache | Force redeploy with empty commit (Step 3) |