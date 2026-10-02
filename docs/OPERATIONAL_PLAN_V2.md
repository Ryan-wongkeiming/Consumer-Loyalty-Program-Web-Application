# CareHub — Operational Plan (V2)

Source directional plan: `docs/REVIEW_AND_PLAN_V2.md` (2026-10-02).
This document turns that directional plan into an executable, checkpointed
operational plan. Every task below names the file(s) it touches, the
acceptance criteria that prove it is done, and the verification step that
must pass before the next phase starts.

**Rule of the plan:** work is done in phases. Each phase ends at a
**checkpoint gate** where the work is verified (lint + `tsc --noEmit` +
browser exercise + tests where they exist) and signed off before the next
phase begins. Do not start a phase whose entry criteria are not met.

---

## 1. How to use this plan

- Each phase has **Entry criteria**, **Tasks**, **Exit criteria (Definition
  of Done)**, **Verification**, and **Rollback**.
- A **checkpoint** is a hard stop. The directional plan says: "implementation
  starts at bug-fix pass 1 only, then stops for a browser check before pass
  2." That rule is enforced here as a gate.
- **Decision gates** (section 4) block downstream work. Do not start Pass 2
  or Stage A until the listed decisions are recorded in the decision log.
- **Do not run `rebuild_all.sql` on the live database.** It assumes a fresh
  DB. Use the numbered migrations in `supabase/migrations/` in filename
  order, or apply new migrations only.

---

## 2. Current-state baseline (verified against the tree on 2026-10-02)

These are already done and must **not** be redone:

| Item | Evidence |
|---|---|
| Loyalty code errors use `result.error` | `src/lib/auth.ts` `redeemLoyaltyCode` |
| React error boundary wraps the app | `src/main.tsx`, `src/components/ErrorBoundary.tsx` |
| Cart survives refresh via `localStorage` | `src/context/CartContext.tsx` |
| Pages are lazy-loaded | `src/App.tsx` |
| Gift + code redemption are single-transaction RPCs | `supabase/migrations/20260930000001_carehub_atomic_redemptions.sql` |
| Per-user redemption rate-limit table | `supabase/migrations/20260930000002_carehub_redemption_rate_limits.sql` |
| Orders SELECT leak fixed (scoped policies) | `supabase/migrations/20260930000000_carehub_fix_orders_select_leak.sql` |
| Data API grants | `supabase/migrations/20260928000000_carehub_data_api_grants.sql` |
| Join-column indexes | `supabase/migrations/20260929000000_carehub_add_join_indexes.sql` |
| CI workflow (lint + `tsc --noEmit`) | `.github/workflows/ci.yml` |

**Still open (manual, live DB):** delete leftover test rows if present:
```sql
DELETE FROM public.orders WHERE full_name LIKE 'RLS_TEST_MARKER%';
```

**Gaps confirmed in the tree:**
- No test runner and no test files (`package.json` has no `test` script).
- No admin / staff surface.
- `formatPrice` is duplicated and inconsistent (`en-US` in `pricing.ts`,
  `vi-VN` in `WishlistPage.tsx`).
- Wishlist has `get`/`remove` but **no `add`** (`src/lib/auth.ts`).
- Heart buttons on product cards, product page, search, and women's-health
  cards have **no click handler**.
- `CartContext` `ADD_ITEM` matches on `product.id` only, so a one-time and a
  subscription line for the same product collapse into one row.
- `CartContext` persists `isOpen`, so a refresh reopens the sidebar.
- Checkout hardcodes `shippingCost = 0`; `pricing.ts` defines
  `STANDARD_SHIPPING_FEE = 50000`.
- Promo lookup lowercases the code (`src/data/promoCodes.ts`), but seeded
  `CAREHUB10` / `CAREHUBONCE` are uppercase, so they never match.
- `CartSidebar` dispatches `discount: validPromo.discount` (raw 10 for a
  percent code) and omits `discountType`.
- The DB trigger `handle_promo_code_usage` records `promo_rec.discount`
  (raw value, not the applied VND), tests `min_order_amount` against the
  already-discounted total, and never checks `applicable_brands`.
- Camera auto-apply uses a stale `promoCode` state via `setTimeout`.
- `ocr-processor` has no auth check, no rate limit, and binarizes the image
  before upload.
- `request-free-sample` does a read → decrement → insert → compensating
  rollback (not one transaction), and rate-limit query failure is fail-open.
- `redeem-loyalty-code` / `redeem-gift` record the rate-limit row **after**
  the RPC, and continue when the limit query fails.

---

## 3. Phase map

```
Phase 0  Pre-flight baseline
Phase 1  Pass 1 — shopper-facing breakage        (checkpoint gate)
Phase 2  Pass 2 — integrity (SQL)                (checkpoint gate)
Phase 3  Pass 3 — operations & catalog           (checkpoint gate)
Phase 4  Stage A — make the loop real            (checkpoint gate)
Phase 5  Stage B — loyalty current for category  (checkpoint gate)
Phase 6  Stage C — platform quality              (checkpoint gate)
```

Phases 1–3 are the bug-fix passes. Phases 4–6 are the upgrade roadmap.
Phases 4–6 stay a roadmap until the owner picks one; they are sequenced here
so the plan is complete.

---

## 4. Decision gates (blocking)

These must be answered and recorded before the phase that depends on them.
Each decision has an owner and a default if no answer is given.

| # | Decision | Blocks | Default if unanswered | Owner |
|---|---|---|---|---|
| D1 | Which generic seed SKUs must disappear from the live catalog? | Phase 3 (catalog cleanup) | Keep only rows with a real brand CDN image and a real SKU; flag the rest | Client |
| D2 | Standard shipping fee: keep 50,000 VND for one-time orders, or free shipping for everyone? | Phase 1 (shipping display) | Keep 50,000 VND for one-time; free for all-subscription orders | Client |
| D3 | First payment rail: VietQR only, or VietQR + MoMo/VNPay? | Phase 4 (Stage A payments) | VietQR only | Client |
| D4 | Notification channel for "confirm this delivery": Zalo OA, SMS, or email? | Phase 4 (Stage A COD queue) | Email first, Zalo OA second | Client |
| D5 | Promo code canonical case: store uppercase and compare case-insensitively everywhere? | Phase 1 (promo) | Normalize to uppercase on write, compare case-insensitively on read | Dev |
| D6 | Free shipping threshold (if not all-subscription): what subtotal unlocks free shipping? | Phase 1 (shipping) | No threshold; only all-subscription orders ship free | Client |

**Decision log** (append as decisions are made):

| Date | Decision | Value | Owner |
|---|---|---|---|
| — | — | — | — |

---

## 5. Phase 0 — Pre-flight baseline

**Entry criteria:** repo is on `main`, `npm install` succeeds, Supabase env
vars are present.

**Tasks**
1. Confirm the working tree builds and type-checks today:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
2. Confirm the live DB is reachable and the app renders (browser).
3. Record the current `git` branch and commit so every phase is revertible.
4. Confirm the leftover `RLS_TEST_MARKER` rows are gone (or schedule the
   manual delete).

**Exit criteria**
- `npm run lint` and `npx tsc --noEmit` both pass on the unmodified tree.
- A baseline commit is tagged (e.g. `baseline-v2`).

**Verification:** run the three commands; capture output.

**Rollback:** `git checkout <baseline>`.

---

## 6. Phase 1 — Pass 1: shopper-facing breakage

**Entry criteria:** Phase 0 exit criteria met. Decisions D2, D5, D6 recorded.

### 6.1 Promo codes are split-brained

**Tasks**
1. **Case-insensitive lookup.** In `src/data/promoCodes.ts`, change the
   `.eq('code', code.trim().toLowerCase())` to a case-insensitive match
   (`.ilike('code', code.trim())`). Keep the returned `code` as stored.
2. **Canonical case (D5).** Decide and apply one canonical case. If storing
   uppercase, ensure the DB trigger `handle_promo_code_usage` compares
   case-insensitively too (`WHERE code = NEW.promo_code_applied` →
   `WHERE code ILIKE NEW.promo_code_applied`), and that the seed rows
   (`CAREHUB10`, `CAREHUBONCE`) are stored in that canonical case.
3. **Cart stores the computed VND + type.** In `src/components/CartSidebar.tsx`
   `handleApplyPromoCode`, dispatch `discount: validPromo.discountAmount`
   (not `validPromo.discount`) and add `discountType: validPromo.discountType`.
   This matches `CheckoutPage.tsx`, which already does it correctly.
4. **DB trigger records the applied amount.** In
   `supabase/migrations/20260921000001_carehub_promo_enhancements.sql`
   (and any new migration), change the usage insert to record the actual
   applied VND. For a percent code, compute `round(subtotal * discount/100)`
   inside the trigger; for a fixed code, use `discount`.
5. **DB trigger checks `min_order_amount` on the pre-discount subtotal.**
   The trigger currently tests `NEW.total_amount` (already discounted).
   Compute the pre-discount subtotal from `order_items` for the order, or
   pass it through, and test against that.
6. **DB trigger checks `applicable_brands`.** If the code has
   `applicable_brands`, verify every line item's product brand is in the
   list; otherwise raise an exception.

**Acceptance criteria**
- `CAREHUB10` (percent) and `CAREHUBONCE` (unique) apply from both the cart
  sidebar and checkout.
- A percent code subtracts the correct VND (not ~10 VND) in both surfaces.
- The DB records the correct applied VND in `promo_code_usages`.
- A code with a brand restriction is rejected when the cart contains a
  non-matching brand.
- A code below its minimum order is rejected based on the pre-discount
  subtotal.

**Verification**
- `npm run lint`, `npx tsc --noEmit`.
- Browser (desktop + mobile): apply `CAREHUB10` in cart and in checkout;
  confirm the discount is 10% of subtotal. Apply `CAREHUBONCE`; confirm it
  works once and is then rejected. Confirm a brand-restricted code is
  rejected on a mismatched cart.
- SQL: insert a test order with a percent code and confirm
  `promo_code_usages.discount_amount_applied` is the VND amount.

**Rollback:** revert the promo files; the DB trigger change is a new
migration, so it can be reverted by dropping the function and re-creating
the prior version.

### 6.2 Camera promo auto-apply uses a stale code

**Tasks**
1. In `src/components/CartSidebar.tsx` `handleCameraCapture`, pass the
   scanned string directly into the validator instead of relying on
   `setTimeout(() => handleApplyPromoCode(), 100)` reading stale state.
   Refactor `handleApplyPromoCode` to accept an optional `codeOverride`
   parameter, or call a shared `applyPromo(code)` helper.
2. Do the same in `src/pages/CheckoutPage.tsx` `handleCameraCapture`.

**Acceptance criteria**
- Scanning a code applies that exact code, not the previously typed one.
- No `setTimeout` race remains.

**Verification:** browser — type a wrong code, then scan a valid code; the
valid code applies. Repeat in both cart and checkout.

### 6.3 Wishlist cannot be filled

**Tasks**
1. Add `addToWishlist(productId)` to `src/lib/auth.ts` (mirror
   `removeFromWishlist`; require login; insert `{ user_id, product_id }`).
2. Wire every heart button:
   - `src/components/ProductCard.tsx` (two hearts: image overlay + footer).
   - `src/pages/ProductPage.tsx` (heart next to add-to-cart).
   - Search results cards and women's-health cards.
3. Require login: if not authenticated, open the auth modal (or redirect to
   login) instead of silently doing nothing.
4. Show a filled state when the product is already in the wishlist.
5. Do not navigate when the heart sits inside a product `<Link>` — call
   `e.preventDefault()` / `e.stopPropagation()`.

**Acceptance criteria**
- A signed-in user can add and remove a product from the wishlist from every
  surface that shows a heart.
- A logged-out user is prompted to log in.
- Clicking a heart inside a product link does not navigate to the product.

**Verification:** browser — sign in, add from product card, product page,
search, and women's-health card; confirm the wishlist page lists them; remove
one; confirm the heart state updates. Test logged-out click opens auth.

### 6.4 Cart line identity + persistence

**Tasks**
1. In `src/context/CartContext.tsx` `ADD_ITEM`, match on
   `product.id + isSubscription + deliveryFrequency` (not `product.id`
   alone) so a one-time tin and a subscription tin are separate lines.
2. Do not persist `isOpen`. In `loadInitialState`, strip `isOpen` (force
   `false`) so a refresh does not reopen the sidebar.
3. Re-price from current catalog data when the cart is restored. On load,
   re-fetch products and re-map each stored line's product to the current
   catalog row (so stale prices are replaced). If a product no longer
   exists, drop the line.

**Acceptance criteria**
- Adding a one-time and a subscription of the same product yields two lines.
- A refresh does not reopen the cart drawer.
- A refresh re-prices lines from current catalog data.

**Verification:** browser — add one-time + subscription of the same product;
confirm two lines. Refresh; confirm drawer closed and prices current.

### 6.5 Guest subscription at checkout

**Tasks**
1. In `src/pages/CheckoutPage.tsx`, if the cart has any subscription line and
   the shopper is logged out, block place-order and open the auth modal.
2. Create the subscription through `src/lib/subscriptions.ts`
   `createSubscription` instead of the inline insert.
3. Preserve each line's frequency. The current code reads
   `subscriptionItems[0].deliveryFrequency` and collapses all lines to one
   frequency. Build the subscription items from each line's own frequency.

**Acceptance criteria**
- A logged-out shopper with a subscription in the cart cannot place the order
  until they sign in.
- A subscription with mixed 4-week and 12-week lines stores each line's own
  frequency.

**Verification:** browser — add a subscription product, go to checkout
logged-out; confirm auth is required. Sign in; place order; confirm
`subscription_items` rows carry each line's frequency.

### 6.6 Orphan order on failed line-item insert

**Tasks**
1. In `src/pages/CheckoutPage.tsx`, if the `order_items` insert fails, delete
   or void the order row in the same attempt so a promo is not consumed by an
   empty order. (This is a stopgap until `place_order` in Phase 2 makes the
   whole thing atomic.)

**Acceptance criteria**
- A failed line-item insert leaves no orphan order and does not consume a
  promo code.

**Verification:** browser — force a line-item failure (e.g. invalid product
id) and confirm no orphan order remains.

### 6.7 Currency

**Tasks**
1. Make `formatPrice` in `src/data/pricing.ts` the single source of truth:
   `vi-VN`, VND, 0 decimals.
2. Remove the local `formatPrice` in `src/components/CartSidebar.tsx`,
   `src/components/ProductCard.tsx`, and `src/pages/WishlistPage.tsx`; import
   the shared one.

**Acceptance criteria**
- Every price in the app renders as `900.000 ₫` (vi-VN), not `₫900,000`.

**Verification:** browser — check cart, product card, product page, wishlist,
checkout.

### 6.8 Shipping

**Tasks**
1. In `src/components/CartSidebar.tsx` and `src/pages/CheckoutPage.tsx`,
   replace `shippingCost = 0` with the rule from D2/D6: charge
   `STANDARD_SHIPPING_FEE` unless every line is a subscription (or the order
   is over the agreed threshold).
2. Show the shipping fee in the cart summary and checkout summary.
3. Update the product page copy so it does not promise free shipping for
   subscribers if the rule changes.

**Acceptance criteria**
- A one-time order shows and charges the standard shipping fee.
- An all-subscription order shows free shipping.
- The displayed total matches the charged total.

**Verification:** browser — build a one-time cart and an all-subscription
cart; confirm the shipping line and total in both cart and checkout.

### Phase 1 checkpoint gate

**Exit criteria (all must pass)**
- `npm run lint` clean.
- `npx tsc --noEmit` clean.
- Browser exercise of every item above on desktop and mobile.
- No regression in existing flows (browse, filter, search, add to cart,
  checkout, account, loyalty, free sample).

**Sign-off:** record in the decision log / a phase log. Do not start Phase 2
until this gate passes.

---

## 7. Phase 2 — Pass 2: integrity (needs SQL)

**Entry criteria:** Phase 1 gate passed. Decisions D1, D3 recorded (D3 only
if Stage A payments are in scope; Pass 2 itself needs D1 for catalog only
indirectly).

### 7.1 `place_order` RPC

**Tasks**
1. Create a new migration with a `place_order` function, `SECURITY DEFINER`,
   that:
   - Accepts product ids, quantities, subscription flags, delivery
     frequencies, address, and the promo code. It does **not** accept prices.
   - Loads prices and bundle rules from `products`, recomputes the total
     (bundle tier + subscription discount + frequency bonus + shipping).
   - Validates the promo (percent math, minimum on the pre-discount subtotal,
     brand list, usage limits) and increments usage.
   - Writes `orders`, `order_items`, `promo_code_usages`, and `subscriptions`
     + `subscription_items` in one transaction. Either all commit or none.
   - Returns the order id (and subscription id if any).
2. Rewrite `src/pages/CheckoutPage.tsx` to call `place_order` via
   `supabase.rpc('place_order', {...})` instead of the multi-step inserts.
3. Remove the now-unused inline order/subscription insert logic.

**Acceptance criteria**
- The client cannot set `total_amount` or `price_at_purchase`; the server
  computes them.
- A 0-dong order is impossible.
- A promo is validated and consumed atomically with the order.
- A subscription is created atomically with the order.

**Verification**
- SQL: call `place_order` with a valid and an invalid payload; confirm the
  total is server-computed and a bad promo rolls back the whole order.
- Browser: place a real order; confirm the order, items, promo usage, and
  subscription all appear and the total matches the server amount.

### 7.2 Tighten RLS on orders / order_items

**Tasks**
1. Add a migration that removes the anon `INSERT` policy on `orders` and
   `order_items` (the `WITH CHECK (true)` policies) so anon cannot insert
   arbitrary rows directly. Guest checkout goes through `place_order` only.
2. Grant `EXECUTE` on `place_order` to `anon` and `authenticated`.

**Acceptance criteria**
- An anon direct `INSERT` into `orders` is rejected (42501).
- An anon `place_order` call succeeds.

**Verification:** SQL — attempt a direct anon insert (expect 42501), then
call `place_order` as anon (expect success).

### 7.3 Free sample: one transaction

**Tasks**
1. Create a SQL function `request_free_sample` (or `claim_free_sample`) that
   decrements stock and inserts the request in one transaction, with a
   `FOR UPDATE` lock on the sample row.
2. Rewrite `supabase/functions/request-free-sample/index.ts` to call the
   function instead of read → decrement → insert → compensating rollback.
3. Make the rate-limit check **fail closed**: if the limit query errors,
   reject the request rather than continuing.
4. Do not key anonymous traffic as `unknown`. Use a real client key (IP or a
   signed cookie); if none is available, reject or use a per-request token.

**Acceptance criteria**
- Two concurrent requests for the last unit cannot both succeed.
- A rate-limit query error blocks the request (fail closed).
- Anonymous traffic is not all bucketed under `unknown`.

**Verification:** SQL — call the function concurrently; confirm only one
succeeds for the last unit. Browser — submit a free-sample request; confirm
stock decrements and the request is recorded.

### 7.4 OCR lock-down

**Tasks**
1. In `supabase/functions/ocr-processor/index.ts`, require a logged-in user
   (validate the `Authorization` bearer token like the redeem functions do).
2. Add a per-user hourly cap (reuse `ocr_rate_limits` table or add a new
   one). Fail closed on limit-query error.
3. Stop binarizing the image. In `src/components/CameraCapture.tsx`, send a
   reasonably compressed color frame (e.g. JPEG at ~0.7 quality, capped
   dimensions) instead of the black-and-white thresholded PNG.
4. Move the allowed origin to an env var (`ALLOWED_ORIGIN`), defaulting to
   the GitHub Pages origin, and allow `http://localhost:*` in development.

**Acceptance criteria**
- An unauthenticated OCR call is rejected (401).
- A user is throttled after the hourly cap.
- The image sent to the vision model is a color frame, not binarized.
- Localhost works in dev; the configured origin works in prod.

**Verification:** browser — scan a code while signed in; confirm it works and
the image is color. Call the function without a token (expect 401).

### 7.5 Redeem rate limits: count before, fail closed

**Tasks**
1. In `supabase/functions/redeem-loyalty-code/index.ts` and
   `supabase/functions/redeem-gift/index.ts`, record the rate-limit attempt
   **before** (or inside) the RPC, and do not continue when the limit query
   fails.

**Acceptance criteria**
- A rate-limit query error blocks the redemption (fail closed).
- The attempt is counted even if the RPC later fails.

**Verification:** SQL / function call — simulate a limit-query error and
confirm the request is rejected.

### Phase 2 checkpoint gate

**Exit criteria**
- `npm run lint`, `npx tsc --noEmit` clean.
- All new migrations applied to a staging DB and verified.
- Browser exercise of checkout (guest + signed-in), free sample, OCR, and
  redemption.
- No regression in existing flows.

**Sign-off:** record. **This phase must ship before any real payment
provider.**

---

## 8. Phase 3 — Pass 3: operations and catalog

**Entry criteria:** Phase 2 gate passed. Decision D1 recorded.

### 8.1 Staff / operations surface

**Tasks**
1. Build a small staff area (protected route + role check) OR a protected
   Supabase view plus an email/Zalo webhook. It must surface:
   - New orders.
   - Free-sample requests.
   - Gift redemptions.
   - Subscriptions whose `next_delivery_date` is within N days.
2. A due subscription becomes a task, not a silent date. Pause/skip stays the
   customer action.

**Acceptance criteria**
- Staff can see new orders, sample requests, redemptions, and due
  subscriptions.
- A due subscription surfaces as a task.

**Verification:** browser — place an order, request a sample, redeem a gift,
and set a subscription due soon; confirm each appears in the staff surface.

### 8.2 Catalog cleanup

**Tasks**
1. Write a script that lists products whose image is still a Pexels URL or
   whose id is one of the original generic seeds.
2. Remove or replace them after confirming the real assortment (D1).
3. Replace seeded `rating` / `reviews` with zeros until real reviews exist.

**Acceptance criteria**
- No generic seed product with a Pexels image and invented review counts is
  shown as a real SKU.
- Review counts are not presented as if shoppers wrote them.

**Verification:** run the script; confirm the flagged list matches the
decision in D1.

### 8.3 Error boundary + empty states

**Tasks**
1. Add a per-route error boundary (the current boundary sits above the
   router, so one crashed page stays on the error screen until a full
   reload).
2. Add a visible "could not load products" state instead of an empty shop
   when product/article/topic fetches return `[]` on error.

**Acceptance criteria**
- A crashed route shows a recoverable error state without a full reload.
- A failed products fetch shows a message, not an empty grid.

**Verification:** browser — force a route crash and a fetch failure; confirm
the states.

### 8.4 Cleanup + CI + tests

**Tasks**
1. Delete the `RLS_TEST_MARKER` orders (manual SQL, if present).
2. CI already runs lint + `tsc --noEmit` (`.github/workflows/ci.yml`). Add a
   test step once a runner is added.
3. Add a test runner (e.g. Vitest) and tests for:
   - Pricing math (`getUnitPrice`, bundle tiers, subscription discount).
   - Promo percent math.
   - The `place_order` and free-sample SQL functions (via a test harness or
     integration test).

**Acceptance criteria**
- `npm test` runs and passes.
- Pricing and promo math are covered by unit tests.
- The SQL functions are covered by at least an integration test.

**Verification:** run `npm test`; confirm green.

### Phase 3 checkpoint gate

**Exit criteria**
- `npm run lint`, `npx tsc --noEmit`, `npm test` all pass.
- Staff surface, catalog cleanup, error states, and tests verified.
- No regression in existing flows.

**Sign-off:** record.

---

## 9. Phase 4 — Stage A: make the loop real

**Entry criteria:** Phases 1–3 passed. Decisions D3, D4 recorded.

### 9.1 Earn on both doors
- Keep pack-code scan. Also earn points on a delivered order (e.g. 1 point
  per 10,000 VND, bonus on subscribe-and-save).
- Credit points only when the order is marked delivered, **inside the
  database**, not from the browser.

### 9.2 COD confirmation queue
- Build the staff task and a Zalo OA or SMS/email template for "your next tin
  is due, reply to confirm." Do not auto-charge a card.

### 9.3 Payments that match the market
- Add VietQR / bank transfer first, then MoMo or VNPay. Keep COD.
- Put the provider behind the `place_order` RPC so the amount is the server
  amount.

### 9.4 Own the images
- Copy brand CDN photos into Supabase Storage. Hotlinks break when a brand
  changes a URL.

**Acceptance criteria**
- Points are credited on delivery, server-side.
- A due subscription triggers a confirmation task + notification.
- A payment rail is behind `place_order` and uses the server amount.
- Product images are hosted in Supabase Storage.

**Verification:** browser + SQL — mark an order delivered and confirm points
credit; confirm a due subscription surfaces a task; confirm a payment
attempt uses the server amount.

---

## 10. Phase 5 — Stage B: loyalty current for this category

**Entry criteria:** Stage A passed.

### 10.1 Status tiers
- Member / Plus / Family based on delivered spend or subscribed months.
- Tiers unlock earlier sample access, a birthday gift, a higher subscribe
  discount. Show progress on the loyalty page.

### 10.2 Replenishment by life stage
- Use the baby birth date from the sample form, with consent, to suggest the
  next stage and cadence (4 / 8 / 12 weeks). Keep wording as "helps you
  reorder," not medical advice.

### 10.3 Referral
- Points to the referrer when the friend's first order is delivered. One code
  per account. Cap it.

### 10.4 Real reviews
- Let a signed-in buyer review a delivered SKU. Show those counts. Remove the
  seeded numbers.

### 10.5 Challenges with a short calendar
- Examples: scan 2 pack codes this month, or keep one subscription for 3
  cycles. Reward with points or a sample. Avoid a game layer that hides the
  products.

**Acceptance criteria**
- Tiers compute from delivered spend / subscribed months and show progress.
- Life-stage suggestions use consented baby data.
- Referral credits on the friend's first delivered order.
- Reviews come from real buyers; seeded counts removed.
- Challenges run on a short calendar and reward points/samples.

---

## 11. Phase 6 — Stage C: platform quality

**Entry criteria:** Stage B passed.

### 11.1 PWA
- Home-screen install, offline shell, fast repeat order from the last
  delivered basket.

### 11.2 Wallet pass or Zalo card
- Member number + point balance so staff and shopper see the same tier.

### 11.3 First-party segments
- Health goal, brand, baby age band, subscriber vs one-time. Use for one
  banner and one code, not a third-party ad network.

### 11.4 Privacy
- Extend Vietnam personal-data consent to account creation, baby data, and
  marketing sends. Record the consent timestamp.

### 11.5 Accessibility and speed
- Keyboard and screen-reader pass on header, cart, checkout. Keep route
  splitting. Set width/height on product images to stop layout jump.

### 11.6 Observability
- Error reporting on the edge functions, and an uptime check on the site and
  the products API.

### 11.7 Fraud
- Unique pack codes, velocity limits (already started), staff review when one
  account redeems many codes in a day.

**Acceptance criteria**
- PWA installs and works offline.
- Wallet/Zalo card shows the member number and balance.
- Segments drive one banner and one code.
- Consent timestamps are recorded.
- Accessibility and speed checks pass.
- Edge-function errors are reported; uptime checks run.
- Fraud controls are in place.

---

## 12. Cross-cutting concerns

### 12.1 Test plan
- Unit: pricing math, promo percent math, cart reducer.
- Integration: `place_order`, free-sample function, redeem functions.
- E2E (manual browser): the flows in each phase's verification.

### 12.2 CI
- `.github/workflows/ci.yml` already runs lint + `tsc --noEmit`. Add a test
  job once a runner is added.

### 12.3 Observability
- Add error reporting to the edge functions.
- Add an uptime check on the site and the products API.

### 12.4 Security
- Never commit the `service_role` key. The anon key is public by design; RLS
  protects data.
- Keep CORS locked to the configured origin (env var) + localhost in dev.

---

## 13. Risk register & rollback

| Risk | Likelihood | Impact | Mitigation | Rollback |
|---|---|---|---|---|
| `place_order` breaks guest checkout | Medium | High | Test on staging; keep the old path behind a flag until verified | Revert to the multi-step insert (temporary) |
| Promo case change breaks existing codes | Medium | Medium | Normalize on write; test all seeded codes | Revert the lookup change |
| RLS tightening blocks a legit flow | Medium | High | Test anon + authenticated paths on staging | Re-enable the insert policy (temporary) |
| Free-sample transaction change loses a request | Low | Medium | Test concurrency on staging | Revert to the function |
| Catalog cleanup removes a real SKU | Medium | High | Confirm D1 before deleting; soft-delete (flag) instead of hard delete | Restore from backup |
| Payment rail integration (Stage A) | Medium | High | Keep COD; put provider behind `place_order` | Disable the rail, keep COD |

**General rollback rule:** every phase is a revertible commit. Tag a baseline
before each phase. For DB changes, apply new migrations only (never
`rebuild_all.sql` on live), and keep a backup before applying.

---

## 14. Definition of Done (whole plan)

The directional plan is fully delivered when:

1. **Pass 1** — promo, wishlist, cart identity, guest subscription, orphan
   orders, currency, and shipping are fixed and verified in the browser.
2. **Pass 2** — `place_order` is the only order path, RLS blocks arbitrary
   anon inserts, free sample is one transaction, OCR is locked down, and
   redeem rate limits fail closed.
3. **Pass 3** — a staff surface exists, the catalog is cleaned, error states
   are visible, and tests + CI are green.
4. **Stage A** — points earn on delivery, COD confirmation queue works,
   payments are behind `place_order`, and images are self-hosted.
5. **Stage B** — tiers, life-stage replenishment, referral, real reviews, and
   challenges are live.
6. **Stage C** — PWA, wallet/Zalo card, first-party segments, privacy
   consent, accessibility/speed, observability, and fraud controls are live.
7. **Quality bar** — `npm run lint`, `npx tsc --noEmit`, and `npm test` all
   pass; no regression in existing flows; the handover text no longer
   overstates Zalo/SMS confirmation or "native subscriptions."

---

## 15. Sequencing / dependency graph

```
Phase 0 (baseline)
   └─> Phase 1 (Pass 1)  [needs D2, D5, D6]
          └─> Phase 2 (Pass 2)  [needs D1 for catalog; D3 for payments]
                 └─> Phase 3 (Pass 3)  [needs D1]
                        └─> Phase 4 (Stage A)  [needs D3, D4]
                               └─> Phase 5 (Stage B)
                                      └─> Phase 6 (Stage C)
```

**Hard rule:** do not start a phase until the previous checkpoint gate
passes. Do not run `rebuild_all.sql` on the live database. Do not start Pass
2 before the Pass 1 browser check.
