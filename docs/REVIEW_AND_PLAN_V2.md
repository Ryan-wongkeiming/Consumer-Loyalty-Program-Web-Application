# CareHub diagnosis, bug-fix plan, and upgrade roadmap

Diagnosis date: 2026-10-02. Source review of the React app, four Supabase edge functions, migrations, and `rebuild_all.sql`. The app was not run in a browser in this pass, and the live database was not queried. A few items below are "confirm on the live project" because the SQL in the repo and the database can diverge.

## What this project is

CareHub is a Vietnamese, multi-brand health storefront (Blackmores, GAIA Skin Naturals, The Little Oak Company, HAPPI) on React 18 + TypeScript + Vite 5 + Tailwind + Supabase. It has catalog, cart, COD checkout, promo codes, pack-code loyalty, gift redemption, free samples, subscriptions, wishlist, accounts, and a women's-health content section. It is built to deploy to GitHub Pages (`base: /Consumer-Loyalty-Program-Web-Application/`).

It is a working storefront with a real loyalty and subscription design. It is not yet a complete commerce or loyalty platform. Payment is "we will call you." Prices are trusted from the browser. There is no merchant screen, no order email, and no job that turns a subscription date into the next order.

## Already in good shape (do not redo)

These were open on 2026-09-30 and are done in the current tree:

- Loyalty code errors use `result.error` (`src/lib/auth.ts`).
- React error boundary wraps the app (`src/main.tsx`, `src/components/ErrorBoundary.tsx`).
- Cart survives refresh via `localStorage`.
- Pages are lazy-loaded.
- Gift and code redemption go through single-transaction RPCs, with a per-user rate-limit table.
- Orders SELECT leak, Data API grants, and join indexes have migrations.

Still a manual live-database step from the earlier review: delete leftover rows `DELETE FROM public.orders WHERE full_name LIKE 'RLS_TEST_MARKER%';` if they are still there.

## Current status

| Area | Status |
|---|---|
| Storefront UI | Usable. Vietnamese checkout, filters, brand pages, account pages. |
| Catalog | Real brand SKUs were added later. The original seed still contains generic English "Blackmores" products, one shared stock photo, and hardcoded star counts. Confirm which of those rows are still live. |
| Checkout | Creates an order and line items as the anonymous user. No payment capture. No stock change. No points earned. |
| Promo | Lowercase influencer codes can work. `CAREHUB10` and `CAREHUBONCE` cannot, because lookup lowercases the code and those rows are uppercase. Cart and checkout compute the discount differently. |
| Loyalty | Pack-code earn + gift burn only. A purchase does not earn points. |
| Subscriptions | A database row plus pause / skip / frequency on the account page. Nothing creates the next delivery or notifies anyone. |
| Wishlist | Page can list and remove. Nothing in the UI can add. |
| Edge functions | Redeem paths are authenticated. OCR and free-sample are callable with the public anon key. CORS allows only `https://ryan-wongkeiming.github.io`. |
| Quality bar | No test suite. No admin app. Handover text overstates Zalo/SMS confirmation and "native subscriptions." |

---

## Bugs to fix

### High — money, abuse, or a feature that cannot succeed

1. **Browser sets the price.** Checkout inserts `total_amount` and `price_at_purchase` from the client (`CheckoutPage.tsx`). The promo trigger checks the client total, and it does not recompute line prices. Anyone with the anon key can insert a 0-dong order or burn a one-time code against a fake total. Safe enough only while a human calls every customer. Unsafe the moment a payment gateway is added.

2. **Promo codes are split-brained.**
   - Lookup is `.eq('code', code.trim().toLowerCase())` (`src/data/promoCodes.ts`). Seeded `CAREHUB10` and `CAREHUBONCE` are uppercase, so they never match.
   - Checkout stores `discountAmount` (correct VND). The cart sidebar stores `discount` (raw 10 for a 10% code) and omits `discountType` (`CartSidebar.tsx`). A percent code would subtract about 10 VND, and that dispatch should fail `tsc`.
   - The database trigger records `promo_rec.discount` (10, not 10% of the order) and tests `min_order_amount` against the already-discounted total.
   - `applicable_brands` is never checked.

3. **Camera promo auto-apply uses a stale code.** Both cart and checkout do `setPromoCode(code)` then `setTimeout(() => handleApplyPromoCode(), 100)`. The timeout calls the function that still sees the old input. OCR can fill the box and then apply nothing, or apply the previously typed code.

4. **OCR destroys the picture, then spends API money with no login.** `CameraCapture.tsx` flattens the frame to black and white before upload, which is a poor input for a vision model. `ocr-processor` has no user check and no rate limit. The anon key is public, so anyone can burn `OCR_API_KEY`. CORS is locked to one GitHub Pages origin, so localhost, Vercel, and a custom domain all fail in the browser.

5. **Wishlist cannot be filled.** Heart buttons on the product card, product page, search, and women's-health cards have no click handler. `src/lib/auth.ts` has get and remove, and no add. The header heart only opens an empty page.

6. **Free-sample stock is not one transaction.** The function reads stock, updates `stock = stock - 1` with a compare, then inserts the request, then rolls back by writing the old stock number. Two overlapping requests can restore a stale count. If the rate-limit query errors, the function continues (fail-open). If the platform does not send `x-forwarded-for`, every visitor shares the key `unknown`.

### Medium — wrong commercial behavior

7. **Guest "subscribe" is a normal order.** The product page lets a logged-out shopper choose subscription. Checkout only inserts `subscriptions` when `user` is set, and it does not say so. Comment in checkout says an account is required. The screen does not enforce that.

8. **Same product collapses into one cart line.** `ADD_ITEM` matches on `product.id` only, so a one-time tin and a subscription tin become one row and the second choice overwrites the first.

9. **Several subscription lines share the first line's frequency.** `frequencyWeeks` is parsed from `subscriptionItems[0]` with `includes('4')` / `includes('12')`. Mixed 4-week and 12-week items are stored as one subscription.

10. **A failed line-item insert leaves an orphan order.** Checkout returns an error and does not delete the order row. Promo usage may already have been counted by the insert trigger.

11. **Shipping rule is not the rule on screen.** `pricing.ts` defines a 50,000 VND standard fee and free shipping for subscribers. Cart and checkout hardcode `shippingCost = 0`. The product page still says free shipping is a subscriber benefit.

12. **Subscriptions never become the next order.** Pause, skip, and frequency only edit dates. There is no scheduled job, no merchant queue, and no Zalo, email, or SMS. `handover/CUSTOM_STORE_VS_SHOPIFY.md` says confirmation-before-delivery is built in. It is not.

13. **No merchant surface at all.** New orders, sample requests, redemptions, and due subscriptions exist only as tables. Nobody is emailed.

14. **Catalog trust.** Original seed products (generic calcium, probiotics, CoQ10, and similar) were later labeled `brand = 'Blackmores'` by `20260916000004`. Many still use one Pexels photo and invented `rating` / `reviews` numbers. Real GAIA, Little Oak, and products 3 and 7 were corrected in later migrations. Before launch, the live `products` table needs a pass: remove or replace anything that is not a real SKU, and stop showing hardcoded review counts as if shoppers wrote them.

### Low

15. **Cart drawer state is persisted.** `isOpen: true` is saved, so a refresh reopens the sidebar. Prices inside the saved cart also go stale until the product is re-added.

16. **Two currency formats.** Shared `formatPrice` uses `en-US` (`₫900,000`). Wishlist uses `vi-VN` (`900.000 ₫`).

17. **Error boundary sits above the router.** One crashed page stays on the error screen until a full reload. There is no per-route boundary.

18. **Empty failures look like empty shops.** Product, article, and topic fetches return `[]` on error with no message.

19. **Profile is fetched twice** on login (`AuthContext`: auth callback and the `refreshProfile` effect). One `console.log` remains on unconfirmed signup.

20. **Edge-function copy typos:** "OCR chưa được cấu" and "xảyra".

---

## Bug-fix action plan

Work in three passes. After each pass, run `npm run lint`, `npx tsc --noEmit`, and exercise the flow in the browser (desktop and mobile). Do not run `rebuild_all.sql` on the live database.

### Pass 1 — shopper-facing breakage (about 1–2 days)

- Promo: look up codes case-insensitively; both cart and checkout store the computed VND amount and `discountType`; camera apply passes the scanned string into the validator directly.
- Wishlist: add `addToWishlist`, wire every heart, require login, show filled state, and do not navigate when the heart sits inside a product link.
- Cart: identity of a line is product + subscription flag + frequency. Do not persist `isOpen`. Re-price from current catalog data when the cart is restored.
- Subscription at checkout: if the cart has a subscription and the shopper is logged out, block place-order and open auth. Create the subscription through `src/lib/subscriptions.ts` instead of a second inline insert. Preserve each line's frequency.
- Checkout failure: if line items fail, delete or void the order in the same attempt so a promo is not consumed by an empty order.
- Currency: one `formatPrice` (`vi-VN`, VND, 0 decimals) used everywhere.
- Shipping: charge `STANDARD_SHIPPING_FEE` unless every line is a subscription (or the order is over a threshold you confirm). Show that number in cart and checkout.

### Pass 2 — integrity (about 2–3 days, needs SQL)

- New order RPC, `place_order`, security definer, called by checkout. It loads prices and bundle rules from `products`, recomputes the total, validates the promo (including percent, minimum on the pre-discount subtotal, brand list, and usage), writes order, items, promo usage, and subscription in one transaction. The client sends product ids, quantities, flags, address, and the code. It does not send prices.
- Tighten RLS so anon cannot insert arbitrary `total_amount` / `price_at_purchase`. Guest checkout still works, through the RPC only.
- Free sample: one SQL function that decrements stock and inserts the request together. Rate-limit fails closed. Do not key anonymous traffic as `unknown`.
- OCR: require a logged-in user, add a per-user hourly cap, stop binarizing the image (send a reasonably compressed color frame), and allow the configured site origin plus localhost in development. Move the allowed origin to an env var.
- Redeem rate limits: count the attempt before the RPC, or inside it, and do not continue when the limit query fails.

### Pass 3 — operations and catalog (about 2 days)

- Small staff area, or a protected Supabase view plus an email/Zalo webhook, for: new orders, sample requests, gift redemptions, and subscriptions whose `next_delivery_date` is within N days. Pause/skip stays the customer action. A due row becomes a task, not a silent date.
- Catalog cleanup script: list products whose image is still Pexels or whose id is one of the original generic seeds. Remove or replace them after you confirm the real assortment. Replace seeded `rating` / `reviews` with zeros until real reviews exist.
- Per-route error boundary and a visible "could not load products" state.
- Delete the two `RLS_TEST_MARKER` orders if they remain.
- Add a GitHub Action for lint + `tsc --noEmit`. Add tests for pricing math, promo percent math, and the `place_order` / free-sample SQL functions.

Pass 1 is safe to start immediately. Pass 2 should ship before any real payment provider. Pass 3 is what makes the current subscription promise true.

---

## Upgrade roadmap

Direction: a Vietnam-first health loyalty shop, not a generic points clone and not a Shopify rewrite. The useful 2026 pattern in this category is replenishment loyalty: the shop remembers the tin, the baby stage, and the last code scan, then makes the next purchase shorter and more rewarding. CareHub already has the pieces (pack codes, bundles, subscribe-and-save, free samples, health-goal tags). They are not connected.

### Stage A — make the loop real (do this before new features)

Depends on bug-fix passes 1–3.

- **Earn on both doors.** Keep pack-code scan. Also earn points on a delivered order (for example 1 point per 10,000 VND, bonus on subscribe-and-save). Credit points only when the order is marked delivered, inside the database, not from the browser.
- **COD confirmation queue.** The promised model is confirm-then-ship. Build the staff task and a Zalo OA or SMS/email template for "your next tin is due, reply to confirm." Do not auto-charge a card.
- **Payments that match the market.** Add VietQR / bank transfer first, then MoMo or VNPay. Keep COD. Put the provider behind the `place_order` RPC so the amount is the server amount.
- **Own the images.** Copy brand CDN photos into Supabase Storage. Hotlinks already break when a brand changes a URL.

### Stage B — loyalty that is current for this category

- **Status tiers, not a bigger points number.** For example Member / Plus / Family, based on delivered spend or subscribed months. Tiers unlock earlier sample access, a birthday gift, and a higher subscribe discount. Show progress on the loyalty page.
- **Replenishment by life stage.** Formula shoppers already give a baby birth date on the sample form. Use that, with consent, to suggest the next stage and the right cadence (4 / 8 / 12 weeks). This is the highest-value personalization for this catalog. Keep health wording as "helps you reorder," not as medical advice.
- **Referral.** Give points to the referrer when the friend's first order is delivered. One code per account. Cap it.
- **Real reviews.** Let a signed-in buyer review a delivered SKU. Show those counts. Remove the seeded numbers.
- **Challenges with a short calendar.** Examples: scan 2 pack codes this month, or keep one subscription for 3 cycles. Reward with points or a sample. Avoid a game layer that hides the products.

### Stage C — platform quality expected of a 2026 loyalty shop

- **PWA.** Home-screen install, offline shell, and a fast repeat order from the last delivered basket.
- **Wallet pass or Zalo card** for the member number and point balance, so staff and the shopper see the same tier.
- **First-party segments.** Health goal, brand, baby age band, and subscriber vs one-time. Use them for one banner and one code, not a third-party ad network.
- **Privacy.** Vietnam personal-data consent is already started on the sample form. Extend it to account creation, baby data, and marketing sends. Record the consent timestamp.
- **Accessibility and speed.** Keyboard and screen-reader pass on header, cart, and checkout. Keep route splitting. Set width/height on product images to stop layout jump.
- **Observability.** Error reporting on the edge functions, and an uptime check on the site and the products API.
- **Fraud.** Unique pack codes, velocity limits (already started), and a staff review when one account redeems many codes in a day.

### Explicitly not the next step

- Replatforming to Shopify. The custom model (COD confirm-each-cycle, multi-brand, pack codes) is the reason this app exists. The gap is unfinished operations, not the framework.
- A native app. A PWA plus Zalo covers this audience first.
- AI health chat. A goal-based product finder on tags you already store is enough. An advice bot creates claim and liability risk for supplements and infant formula.

## Suggested order of work

1. Bug-fix pass 1 (promo, wishlist, cart, guest subscription, orphan orders, currency, shipping display).
2. Bug-fix pass 2 (`place_order`, free-sample transaction, OCR lock-down).
3. Bug-fix pass 3 (staff queue, catalog cleanup, CI, tests).
4. Upgrade stage A (earn on delivery, VietQR, image hosting, Zalo/SMS confirm).
5. Upgrade stage B, then C.

If this plan is approved, implementation starts at bug-fix pass 1 only, then stops for a browser check before pass 2. Upgrade stages stay a roadmap until you pick one.

## Decisions needed before pass 2 and stage A

- Confirm the live catalog: which generic seed SKUs must disappear.
- Standard shipping fee: keep 50,000 VND for one-time orders, or free shipping for everyone.
- First payment rail: VietQR only, or VietQR plus MoMo/VNPay.
- Notification channel for "confirm this delivery": Zalo OA, SMS, or email.
