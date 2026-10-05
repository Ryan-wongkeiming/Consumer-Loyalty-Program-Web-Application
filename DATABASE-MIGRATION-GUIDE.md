# CareHub — Database Migration Guide

Set up the CareHub Supabase database from scratch or apply incremental changes.

---

## Overview

CareHub uses Supabase (PostgreSQL) as its backend. All database changes are managed through SQL migration files in `supabase/migrations/`. There is also a full rebuild script (`rebuild_all.sql`) that creates everything from scratch.

---

## Option A: Fresh Database (Recommended for new setup)

Use this if you are setting up CareHub for the first time.

### Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com/dashboard) and create a new project (free tier works).
2. Wait for the project to initialize.

### Step 2 — Apply the full schema

1. Open **SQL Editor** in your Supabase dashboard.
2. Open `rebuild_all.sql` from this repo.
3. Copy the entire file content → paste into SQL Editor → click **Run**.
4. Wait for success. This creates all tables, policies, functions, and seeds the initial data.

### Step 3 — Configure your environment variables

Go to **Project Settings → API** and copy:
- `Project URL` → set as `VITE_SUPABASE_URL` in your `.env`
- `anon public key` → set as `VITE_SUPABASE_ANON_KEY` in your `.env`

### Step 4 — Verify the database

Run these queries in SQL Editor to confirm the setup:

```sql
-- Check product count
SELECT COUNT(*) FROM products;
-- Should return ~55 products

-- Check promo codes exist
SELECT code, discount_type FROM promo_codes;
-- Should show CAREHUB10, CAREHUBONCE, and influencer codes

-- Check free samples
SELECT id, name, stock FROM free_samples;
-- Should show available sample types
```

---

## Option B: Incremental Migrations (Existing database)

Use this if you already have a CareHub database and want to apply changes without rebuilding.

### Apply migrations in filename order

Migrations are named with timestamps so they can be applied in order:

```bash
# List all migrations in order
ls supabase/migrations/ | sort
```

Apply each one in order using the Supabase SQL Editor or the Supabase CLI.

### Available migrations

| File | Description |
|---|---|
| `20260916000000_carehub_rebrand.sql` | Rebrand to CareHub, update product names |
| `20260916000001_carehub_multibrand.sql` | Add multi-brand support (GAIA, Little Oak, HAPPI) |
| `20260916000002_carehub_product_images.sql` | Update product images |
| `20260916000003_carehub_normalize_categories.sql` | Normalize categories |
| `20260916000004_carehub_blackmores_brand.sql` | Blackmores brand updates |
| `20260916000005_carehub_gaia_health_goals.sql` | GAIA health goals |
| `20260916000006_carehub_ship_readiness.sql` | Ship readiness fixes |
| `20260916000007_carehub_littleoak_prices.sql` | Little Oak prices |
| `20260916000008_carehub_littleoak_full_catalog.sql` | Little Oak full catalog |
| `20260916000009_carehub_littleoak_combos.sql` | Little Oak combos |
| `20260918000000_carehub_happi_products.sql` | HAPPI products |
| `20260918000001_carehub_bundle_subscription.sql` | Bundle + subscription features |
| `20260918000002_carehub_subscriptions.sql` | Subscriptions table |
| `20260918000003_carehub_soldout_jnr_balance.sql` | Sold-out junior balance fix |
| `20260918000004_carehub_mobile_image_widths.sql` | Mobile image widths |
| `20260918000005_carehub_mobile_image_widths_fixed.sql` | Image width fix |
| `20260921000000_carehub_rename_free_samples.sql` | Rename free samples table |
| `20260921000001_carehub_promo_enhancements.sql` | Promo enhancements (percent, expiry, min-order, brands) |
| `20260921000002_carehub_diagnose_orders_rls.sql` | Diagnose orders RLS |
| `20260921000003_carehub_fix_orders_insert_rls.sql` | Fix orders insert RLS |
| `20260921000004_carehub_verify_fix_orders_rls.sql` | Verify orders RLS fix |
| `20260921000005_carehub_fix_orders_select_rls.sql` | Fix orders select RLS |
| `20260921000006_carehub_cleanup_test_rows.sql` | Cleanup test rows |
| `20260928000000_carehub_data_api_grants.sql` | Data API grants |
| `20260929000000_carehub_add_join_indexes.sql` | Add join indexes |
| `20260930000000_carehub_fix_orders_select_leak.sql` | Fix orders SELECT data leak |
| `20260930000001_carehub_atomic_redemptions.sql` | Atomic redemption functions |
| `20260930000002_carehub_redemption_rate_limits.sql` | Redemption rate limits |
| `20261002000000_carehub_place_order.sql` | place_order RPC (server-computed prices) |
| `20261002000001_carehub_orders_rls_tighten.sql` | Tighten orders/order_items RLS |
| `20261003000003_carehub_own_images.sql` | Supabase Storage image hosting |
| `20261004000001_carehub_replenishment_referral.sql` | Replenishment + referral program |
| `20261004000002_carehub_real_reviews.sql` | Real buyer reviews |
| `20261004000003_carehub_challenges.sql` | Challenges calendar |

---

## Important notes

### Never run rebuild_all.sql on an existing database

`rebuild_all.sql` assumes a fresh database. Running it on an existing database will duplicate data and may cause conflicts. Use incremental migrations instead.

### Row Level Security (RLS)

All tables have RLS enabled. Policies control who can read/write each table:

- **Products**: Anyone can read; only service_role can modify
- **Orders**: Anon/authenticated can insert; users can only see their own orders
- **Order items**: Same pattern as orders
- **Promo codes**: Anyone can read active codes; only service_role can modify
- **Subscriptions**: Users can only access their own subscriptions
- **Wishlist**: Users can only manage their own wishlist

### Edge Functions

Edge functions use the service role key (set in function environment variables), not the anon key. They handle:
- OCR promo code scanning
- Loyalty code redemption
- Gift redemption
- Free sample requests

### Rate Limiting

Several endpoints have rate limiting:
- Redemption attempts: max 10 per user per hour
- Free sample requests: max 5 per client per hour
- OCR: requires authenticated user with hourly cap

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "new row violates row-level security" | Missing INSERT policy | Ensure migrations are applied in order |
| "relation does not exist" | Migration skipped or out of order | Check migration order and re-apply |
| Product images broken | Supabase Storage bucket missing | Run `carehub_own_images.sql` migration |
| Promo codes not matching | Case sensitivity issue | Ensure promo codes are stored in uppercase |
| Order creation fails | Service role key not configured | Check edge function environment variables |
