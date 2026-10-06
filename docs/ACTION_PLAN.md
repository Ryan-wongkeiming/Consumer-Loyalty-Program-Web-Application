# CareHub — Action Plan

> Last updated: 2026-10-06

---

## Project Summary

**CareHub** is a Vietnamese multi-brand health storefront (Blackmores, GAIA, Little Oak, HAPPI) built with React 18, TypeScript, Vite 5, Tailwind CSS, and Supabase, deployed to GitHub Pages.

**Company address:** 109 Chapel St, Kingsgrove, NSW 2208, Australia

---

## Phase A — Fundamental Fixes (Supabase Backend)

These are critical database/function fixes that must work before any new pages can be useful.

| # | Item | Status | Notes |
|---|---|---|---|
| A1 | `place_order` RPC — remove `::UUID` casts (`products.id` is TEXT, not UUID) | ✅ Done | Fixed in `20261002000000_carehub_place_order.sql` |
| A2 | Add `bundle_tier` column to `order_items` table | ✅ Done | Fixed in `20261006000001_carehub_add_bundle_tier_to_order_items.sql` |
| A3 | Fix `generate_vietqr_payment_url` RPC — resolve duplicate function signatures | ✅ Done | Simplified to accept TEXT for order_id; frontend returns bank details directly without RPC call |
| A4 | Add tracking columns to `orders` table | ⬜ Pending | Need columns: `tracking_number`, `shipped_at`, `delivered_at`, `status` |
| A5 | Create `order_status_history` table | ⬜ Pending | Track status changes over time (who changed it, when, from what) |
| A6 | Create staff RPC functions | ⬜ Pending | `update_order_status()`, `add_tracking_number()` |
| A7 | Set up RLS policies for staff | ⬜ Pending | Only authenticated staff can view/update orders |
| A8 | Add notification system | ⬜ Pending | Notify customers when order status changes (email or in-app) |

### How to apply Phase A to your live Supabase:

1. Go to https://app.supabase.com → your project → **SQL Editor**
2. Open each migration file under `supabase/migrations/`
3. Paste its contents into SQL Editor and click **Run**
4. Verify no errors appear

---

## Phase B — Enhancements (New Subpages & Features)

These are new features built on top of the working backend.

| # | Item | Priority | Description |
|---|---|---|---|
| B1 | **Fulfillment Page** | High | Dedicated page for logistics team: filterable order list, status workflow, carrier info |
| B2 | **Order Detail Modal** | High | Click any order → see full details, update status, add tracking number |
| B3 | **Bulk Actions** | Medium | Confirm multiple orders at once, mark as shipped, export selected |
| B4 | **CSV Export with UTF-8 BOM** | Medium | Proper Vietnamese character support (fixes garbled text like "VINH NGUY   N TH  NH") |
| B5 | **Subscription Delivery Queue** | Medium | Upcoming deliveries by frequency/week, sorted by date |
| B6 | **Payment Verification Panel** | Low | Flag VietQR orders awaiting confirmation vs COD orders needing follow-up |

---

## Completed Fixes (Deployed)

| # | Fix | Commit |
|---|-----|--------|
| C1 | Login modal opens on checkout instead of redirecting away | `8f44d47` |
| C2 | Thank You screen shows carrier name + estimated delivery time | `711d575` |
| C3 | Proper VietQR payment flow (bank transfer screen before Thank You) | `c3fdf52` |
| C4 | QR code added to VietQR payment screen | `711d575` |
| C5 | Thank You screen auto-redirects after 4 seconds | `67aa14e` |
| C6 | Address updated everywhere to 109 Chapel St, Kingsgrove NSW 2208 | `ec5929a` + `212fc3b` |

---

## Known Limitations

| Item | Impact | Resolution |
|------|--------|------------|
| VietQR uses manual bank transfer info | No automatic payment confirmation | Future: integrate MoMo/ZaloPay/Napas APIs |
| Order status stays "pending" forever | Staff must manually update via Supabase | Phase A4–A8 will fix this |
| No customer notifications | Customers don't know when order ships | Phase A8 will fix this |
| No order search/filter in current UI | Staff can only see all orders at once | Fulfillment Page (B1) will fix this |

---

## Pre-Demo Checklist

See `DEMO-CHECKLIST.md` — 84 items across 13 sections. All items currently unchecked (⬜).

**Before client demo:**
1. Apply remaining Phase A migrations to live Supabase
2. Run through all 84 demo checklist items
3. Fix any issues found during self-test
4. Schedule client presentation

---

## Discussion Threads (Active Topics)

1. **VietQR payment flow** — Working as manual bank transfer. Needs backend API integration for automatic confirmation.
2. **Order fulfillment tracking** — Dedicated Fulfillment page planned (Phase B1–B6). Can already trace/export orders from Supabase today.
3. **CSV export garbled characters** — Excel opens CSVs as ANSI by default. Solution: UTF-8 BOM export in Fulfillment Page.
4. **Lalamove shipping** — Shows correct "2-4 giờ" on Thank You screen. Carrier selection works.
5. **Subscription checkout** — Requires login (auth modal opens correctly now). Subscription items trigger recurring delivery schedule.

---

## Next Immediate Steps

1. **Apply Phase A4–A8** to live Supabase (tracking columns, status history table, staff RPC functions, RLS policies)
2. **Test end-to-end checkout** — place a test order with COD, verify it appears in Supabase
3. **Build Fulfillment Page** (Phase B1) — start with the highest priority item
4. **Run full self-test** using DEMO-CHECKLIST.md
