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

## Phase Z — Zalo Integration

> Directive received 2026-10-06. Primary goal: **ZNS notifications**, **Zalo OA chat/support**, and **Zalo Mini App storefront**. Also: **log in via Zalo account**. Customers are Vietnamese (valid phone numbers). Zalo is **needed in the client demo**.
>
> **Reality check:** Zalo business verification (OA verification + developer app + Zalo Cloud Account) takes days. Full Mini App = a second frontend. So the plan splits into **achievable-for-demo** (Z1–Z4) and **post-demo** (Z5–Z8).
>
> **Status legend:** ✅ code built & pushed · 🟡 code built, needs account/secrets to activate · ⬜ not started

---

### Z1 — Zalo OAuth Login ("Log in via Zalo") — 🟡 code built, needs Zalo app

| Item | Detail |
|---|---|
| **Goal** | Let users sign in / create account with their Zalo account, in addition to email+password |
| **Status** | **Code built & pushed** (commit `444ef47`) — needs the Zalo developer app + secrets to activate |
| **Files** | `src/lib/zalo.ts` (OAuth helpers), `src/pages/ZaloAuthCallbackPage.tsx`, `supabase/functions/zalo-auth/index.ts`, `supabase/migrations/20261006000009_carehub_zalo_integration.sql` (zalo_id columns) |
| **Frontend** | "Đăng nhập bằng Zalo" button in AuthModal (shows only when `VITE_ENABLE_ZALO=true`); `/auth/callback/zalo` route completes login |
| **Backend** | `zalo-auth` edge function exchanges OAuth code → creates/links a Supabase user keyed to `zalo_id`; profile stores `zalo_id`, `zalo_phone`, `zalo_avatar_url` |
| **How it works** | Zalo OAuth 2.0 via developers.zalo.me; deterministic email `zalo_<id>@carehub.local`; magic-link token minted and verified client-side via `verifyOtp` |
| **Demo** | ✅ Achievable — needs the Zalo developer app approved + `ZALO_APP_ID`/`ZALO_APP_SECRET`/`ZALO_REDIRECT_URI` secrets |
| **Effort** | Medium |

### Z2 — ZNS Notifications (Order/Payment/Shipping) — 🟡 code built, needs templates

| Item | Detail |
|---|---|
| **Goal** | Auto-send Zalo template messages to customer phone on key events: order confirmed, shipped, delivered, payment received, subscription renewal, loyalty tier change |
| **Status** | **Code built & pushed** (commit `444ef47`) — needs ZNS templates approved + `ZALO_ZNS_ACCESS_TOKEN`/template-id secrets |
| **Files** | `supabase/functions/send-zns/index.ts`, `src/lib/zalo.ts` (`sendZnsNotification`), `supabase/migrations/20261006000009_carehub_zalo_integration.sql` (`zns_log` table) |
| **Wiring** | **Directly hooks into the Fulfillment Page** — `update_order_status` → `order_confirmed`/`order_shipped`/`order_delivered`; `add_tracking_number` → `order_shipped`. Each triggers `sendZnsNotification()`. |
| **Backend** | `send-zns` edge function → ZNS template API (`business.openapi.zalo.me/message/template`); normalizes VN phone to E.164 (`+84...`); logs every send to `zns_log` |
| **Demo** | ✅ Achievable — if ZNS templates approved in time. Fallback: Zalo OA message via UID (no template approval) |
| **Effort** | Medium |

### Z3 — Zalo OA (Official Account) Chat & Support — ⬜ not started

| Item | Detail |
|---|---|
| **Goal** | Customers follow CareHub OA, chat for support, receive order updates in Zalo chat |
| **How** | OA OpenAPI (`openapi.zalo.me/v2.0`) + webhooks (signed `X-ZEvent-Signature`); chatbot + live agent handoff; support widget |
| **Wiring** | OA is the hub that delivers ZNS and ZaloPay; webhook receives incoming messages/follows; store `oa_user_id` (UID) on profile for 1:1 messaging |
| **Frontend** | "Theo dõi CareHub trên Zalo" button in Footer/Header; optional chat widget |
| **Demo** | ✅ Achievable — if OA is verified (see Z4) |
| **Effort** | Medium |

### Z4 — Zalo Account Setup (Prerequisite for Z1–Z3) — 🟡 the long pole

| Item | Detail | Time |
|---|---|---|
| **Official Account (OA)** | Register + verify business OA at oa.zalo.me | 1–5 days |
| **Developer App** | Create app at developers.zalo.me, get `app_id` + `secret`, enable OAuth (PKCE) | ~1–2 days |
| **Zalo Cloud Account (ZCA)** | Set up billing/credits for ZNS + ZaloPay | 1–2 days |
| **ZNS Templates** | Submit & get approved (order confirm, shipping, payment, renewal) | 1–3 days |
| **Demo flag** | All demo features behind `VITE_ENABLE_ZALO` — if accounts aren't ready, demo falls back to COD/VietQR only | — |

### Z4a — Activation Checklist (run once accounts are ready)

1. **Apply migration** — paste `supabase/migrations/20261006000009_carehub_zalo_integration.sql` into Supabase SQL Editor → Run.
2. **Deploy edge functions** — `supabase functions deploy zalo-auth` and `supabase functions deploy send-zns`.
3. **Set secrets** in Supabase (Edge Functions → Secrets):
   - Login: `ZALO_APP_ID`, `ZALO_APP_SECRET`, `ZALO_REDIRECT_URI`
   - ZNS: `ZALO_ZNS_ACCESS_TOKEN`, `ZALO_PHONE_ID`, `ZNS_TEMPLATE_ORDER_CONFIRMED`, `ZNS_TEMPLATE_ORDER_SHIPPED`, `ZNS_TEMPLATE_ORDER_DELIVERED`, `ZNS_TEMPLATE_PAYMENT_RECEIVED`
4. **Set env flags** in `.env.production`: `VITE_ENABLE_ZALO=true`, `VITE_ZALO_APP_ID=<app_id>`.
5. **Add the OA redirect URL** in the Zalo developer app (the `/auth/callback/zalo` route) so Zalo can redirect back.

### Z5 — ZaloPay Payment Method — ⬜ post-demo

| Item | Detail |
|---|---|
| **Goal** | Add ZaloPay as a third checkout option (beside COD & VietQR) |
| **How** | ZaloPay gateway API (`openapi.zalopay.vn/v2/create`); customer pays with Zalo wallet / bank card; verify via callback/IPN |
| **Demo** | ⬜ Post-demo (needs ZaloPay merchant account) |
| **Effort** | Medium |

### Z6 — Zalo Mini App Storefront — ⬜ post-demo

| Item | Detail |
|---|---|
| **Goal** | Full storefront running inside Zalo (catalog, cart, checkout, loyalty) — effectively a second frontend |
| **How** | Zalo Mini App SDK (mini.zalo.me); linked to verified OA; ZaloPay checkout |
| **Demo** | ⬜ Post-demo (largest effort) |
| **Effort** | High |

### Z7 — Broadcasts & Loyalty in Zalo — ⬜ post-demo

| Item | Detail |
|---|---|
| **Goal** | Broadcast campaigns, loyalty points/tiers in Zalo, gamification |
| **How** | OA broadcast (targeting by demographics/tags) + Mini App loyalty module |
| **Effort** | Medium-High |

### Z8 — Security & Compliance

| Item | Detail |
|---|---|
| **Token lifecycle** | OAuth refresh (~25h access / ~3mo refresh); auto-refresh in edge function |
| **Webhook verification** | Verify `X-ZEvent-Signature` (SHA-256); respond 200 |
| **Spam compliance** | Only transactional messages; templates approved; no unsolicited marketing |
| **Phone privacy** | Hash/mask phone before logging; store only what's needed |
| **Rate limits** | Respect API rate limits; queue sends; retry with backoff |

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
| C7 | Dedicated Fulfillment Page with status workflow + CSV export | `9d2b12e` |
| C8 | Role-based access control (staff/admin protect staff pages) | `1ac978f` + `455c090` |
| C9 | AuthContext re-render loop fixed (header flashing) | `684924c` |
| C10 | Zalo integration: OAuth login (Z1) + ZNS notifications wired to Fulfillment (Z2) | `444ef47` |

---

## Known Limitations

| Item | Impact | Resolution |
|------|--------|------------|
| VietQR uses manual bank transfer info | No automatic payment confirmation | Future: ZaloPay / MoMo / Napas APIs |
| Order status stays "pending" forever | Staff must manually update via Supabase | Fulfillment Page + ZNS hooks (Z2) |
| No customer notifications | Customers don't know when order ships | **ZNS notifications (Z2)** |
| No order search/filter in current UI | Staff can only see all orders at once | Fulfillment Page (B1) |

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
6. **Zalo integration (Phase Z)** — ZNS notifications + OA chat + Zalo login for demo; Mini App + ZaloPay post-demo. **Z1/Z2 code built & pushed (`444ef47`); needs Zalo accounts/secrets to activate.** See the Zalo activation checklist (Z4a).

---

## Next Immediate Steps

1. **Start Zalo account setup (Z4)** — this is the long pole. Submit OA verification + developer app + ZNS templates ASAP so Z1–Z3 are ready for the demo.
2. **Run Z4a activation checklist** once Zalo accounts are approved (apply migration, deploy edge functions, set secrets, flip `VITE_ENABLE_ZALO`).
3. **Apply Phase A4–A8** to live Supabase (tracking columns, status history table, staff RPC functions, RLS policies).
4. **Test end-to-end checkout** — place a test order with COD, verify it appears in Supabase, then confirm the ZNS hook fires.
5. **Run full self-test** using DEMO-CHECKLIST.md.
