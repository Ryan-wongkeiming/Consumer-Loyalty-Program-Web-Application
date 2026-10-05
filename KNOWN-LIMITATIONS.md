# CareHub — Known Limitations

Transparent list of what this version does and does not do. These are gaps the client's team should be aware of before going live, and items that can be addressed in future iterations.

---

## 1. Payment & Fulfillment

### COD only — no payment gateway integration

The app currently accepts Cash on Delivery (COD) orders only. There is no credit card processing, bank transfer automation, or digital wallet integration.

**Impact:** All payments are collected manually by the delivery driver. The order total shown at checkout is trusted from the client side until `place_order` was added in Phase 2 (which now computes prices server-side).

**Future work:** Integrate VietQR, MoMo, VNPay, or a card processor through the `place_order` RPC so the amount is always server-computed.

### No automated email/SMS/Zalo notifications

Orders, confirmations, shipping updates, and subscription reminders are not sent automatically. Staff must contact customers manually (phone call, Zalo message, etc.).

**Impact:** Higher operational workload for the team. Confirmation-before-delivery relies on staff calling each customer.

**Future work:** Add email (SendGrid/Mailgun), SMS (Zalo OA API, Twilio), or Zalo Official Account integration for automated notifications.

### No merchant/admin web application

There is no standalone admin panel. Order management, product editing, and reporting happen through the staff dashboard route inside the main app or directly in Supabase SQL Editor.

**Impact:** Limited functionality for non-technical operations staff. Reporting requires writing SQL queries.

**Future work:** Build a dedicated admin portal with analytics, bulk operations, and export features.

---

## 2. Loyalty Program

### Points earn on pack-code scan only (not on delivered orders yet)

Currently, loyalty points are earned when customers scan pack codes. The planned enhancement (earned on delivered orders, e.g., 1 point per 10,000 VND) has been implemented in the database layer (`earn_on_delivery` function) but may need frontend wiring depending on deployment status.

**Impact:** Customers who don't have pack codes (e.g., repurchased via subscription without physical packaging) miss out on earning points.

**Future work:** Ensure the `earn_on_delivery` function is triggered when orders are marked "delivered" and display earned points on the order confirmation page.

### Referral program tracked but not surfaced in UI

The referral data model exists (referrals table, referral code per user) but there is no UI for users to share their referral code or see referral earnings.

**Impact:** Referral program cannot be marketed to customers.

**Future work:** Add referral code display on profile page, share button, and referral earnings tracking on loyalty page.

### Real reviews table created but not yet displayed

The `product_reviews` table exists and supports real buyer reviews (only verified purchasers can review). However, the product pages still show seeded/hardcoded review counts rather than actual review data.

**Impact:** Shoppers see fake review numbers until real reviews accumulate and the UI is wired up.

**Future work:** Replace seeded ratings with actual review averages; add review submission form for verified buyers.

---

## 3. Subscription Features

### Subscriptions are manual, not automated

When a subscription's next delivery date arrives, nothing happens automatically. There is no scheduled job that creates the next order, charges the customer, or sends a notification.

**Impact:** Staff must manually create the next order based on the subscription schedule. This works for COD (confirm-before-ship model) but requires human effort.

**Future work:** Add a cron job or Supabase Edge Function that runs daily, finds due subscriptions, and either creates pending orders or sends confirmation requests.

### Subscription streaks not tracked

There is no concept of a "subscription streak" (e.g., "you've been a subscriber for 6 months") that could unlock tier benefits or rewards.

**Future work:** Calculate streak duration from first subscription date and tie it to loyalty tier progression.

---

## 4. Catalog & Content

### Some products may still use stock photos

Products whose images were originally from Pexels/Pixabay may not have been replaced with brand-official photos yet. Use the `catalog_cleanup.mjs` script to identify these before launch.

**Impact:** Product images may look generic or break if external CDN URLs change.

**Future work:** Replace all stock photos with brand-hosted images in Supabase Storage.

### Seeded rating/review counts may still show invented numbers

Products that haven't received real reviews may still display hardcoded rating and review counts from the seed data.

**Impact:** Shoppers may trust review counts that were never written by real customers.

**Future work:** Reset all seeded counts to zero until real reviews exist; display actual averages from the `product_reviews` table.

---

## 5. Technical Limitations

### No test suite

The app has no automated tests (unit, integration, or end-to-end). Code quality relies on linting (`npm run lint`) and TypeScript type-checking (`tsc --noEmit`).

**Impact:** Changes risk introducing regressions that won't be caught until manual testing.

**Future work:** Add Vitest/Jest for unit tests on pricing logic, cart reducer, and promo validation. Add Playwright/Cypress for E2E tests on critical flows.

### No per-route error boundaries (may have been added in Phase 3)

Depending on whether Phase 3 was deployed, error handling may still use a single top-level error boundary instead of per-route boundaries.

**Impact:** If one page crashes, the entire app shows an error screen until full reload.

**Future work:** Wrap each route with its own error boundary component.

### Single currency (VND only)

The app only supports Vietnamese Dong (VND). No multi-currency support.

**Impact:** Not suitable for international customers or cross-border sales.

### No analytics or tracking

No Google Analytics, Facebook Pixel, or any other analytics tool is configured.

**Impact:** Cannot track visitor behavior, conversion rates, or campaign effectiveness.

**Future work:** Add analytics tracking for page views, product clicks, cart additions, and checkout completion.

---

## 6. Platform Limitations

### GitHub Pages hosting constraints

The app is built for GitHub Pages hosting, which has limitations:

| Constraint | Impact |
|---|---|
| No server-side rendering | SEO depends on static content; dynamic data loads client-side |
| Custom domain requires DNS setup | HTTPS automatic after DNS configuration |
| Bandwidth limits | GitHub Pages has fair-use bandwidth limits |
| No backend compute | All server logic must go through Supabase edge functions |

### No PWA installed (manifest may have been added in Phase 6)

Depending on whether Phase 6 was deployed, the app may not support home-screen installation, offline access, or push notifications.

**Impact:** Users cannot install the app on their phone home screen.

**Future work:** Ensure service worker is active, manifest.json is correct, and offline shell loads correctly.

---

## 7. What This Version Does NOT Do

These are explicitly out of scope for the current delivery:

| Item | Reason |
|---|---|
| Shopify migration | The custom COD + pack-code model is the reason CareHub exists |
| Native mobile app | PWA plus Zalo covers this audience first |
| AI health chatbot | Creates claim/liability risk for supplements and infant formula |
| Multi-language support | Vietnamese-only for now |
| Multi-storefront | Single storefront serving all brands |

---

*This document should be shared with decision makers so they understand the current state and can plan future investments accordingly.*
