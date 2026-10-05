# CareHub — Demo Checklist

**Purpose:** Verify every flow works end-to-end before showing the client.
**When to run:** Before Phase C (Client Demo) starts.
**How to use:** Go through each section in order. Mark ✅ when verified, ❌ if broken, and note what needs fixing.

---

## 0. Environment Setup

| # | Check | Status | Notes |
|---|---|---|---|
| 0.1 | `npm install` succeeds without errors | ⬜ | |
| 0.2 | `.env.example` has placeholders only (no real credentials) | ⬜ | |
| 0.3 | `npm run lint` passes clean | ⬜ | |
| 0.4 | `npx tsc --noEmit` passes clean | ⬜ | |
| 0.5 | `npm run build` produces dist/ folder | ⬜ | |
| 0.6 | `npm run dev` starts successfully | ⬜ | |
| 0.7 | App loads at `http://localhost:5173/Consumer-Loyalty-Program-Web-Application/` | ⬜ | |

---

## 1. Browse & Discover

| # | Check | Status | Notes |
|---|---|---|---|
| 1.1 | Homepage loads with products from all brands (Blackmores, GAIA, Little Oak, HAPPI) | ⬜ | |
| 1.2 | Brand filter works (LittleOak / HAPPI / GAIA / Blackmores) | ⬜ | |
| 1.3 | Category filter works (Vitamins, Infant Formula, Baby Skin Care, etc.) | ⬜ | |
| 1.4 | Search returns relevant results | ⬜ | |
| 1.5 | Product detail page loads correctly | ⬜ | |
| 1.6 | Product images load (should be from Supabase Storage, not brand CDNs) | ⬜ | |
| 1.7 | Sold-out products show "Hết hàng" state | ⬜ | |
| 1.8 | Women's health content section loads | ⬜ | |
| 1.9 | Article/topic detail pages load | ⬜ | |

---

## 2. Wishlist

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Signed-in user can add product to wishlist from product card | ⬜ | |
| 2.2 | Signed-in user can add product to wishlist from product page | ⬜ | |
| 2.3 | Heart button inside product link doesn't navigate away | ⬜ | |
| 2.4 | Logged-out user sees auth prompt when clicking heart | ⬜ | |
| 2.5 | Wishlist page lists added products | ⬜ | |
| 2.6 | Can remove product from wishlist | ⬜ | |
| 2.7 | Add product from wishlist → cart works | ⬜ | |

---

## 3. Cart

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Add one-time product to cart | ⬜ | |
| 3.2 | Add subscription of same product creates separate line | ⬜ | |
| 3.3 | Quantity increment/decrement works | ⬜ | |
| 3.4 | Remove item from cart works | ⬜ | |
| 3.5 | Cart sidebar closes when toggled | ⬜ | |
| 3.6 | Refresh page does NOT reopen cart sidebar | ⬜ | |
| 3.7 | Refresh page re-prices lines from current catalog data | ⬜ | |
| 3.8 | Promo code input works | ⬜ | |
| 3.9 | Camera scan auto-applies scanned code (not stale) | ⬜ | |

---

## 4. Promo Codes

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | CAREHUB10 (percent) applies correct VND discount | ⬜ | Should be 10% of subtotal |
| 4.2 | CAREHUBONCE (unique) applies once then rejects | ⬜ | |
| 4.3 | Promo works from both cart sidebar and checkout | ⬜ | |
| 4.4 | Promo rejection shows clear error message | ⬜ | |
| 4.5 | Only one promo code per cart/order | ⬜ | |

---

## 5. Checkout

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Guest checkout form validates all required fields | ⬜ | |
| 5.2 | Province/city dropdown populates wards | ⬜ | |
| 5.3 | Shipping fee displays correctly (30,000 VND for one-time orders) | ⬜ | |
| 5.4 | All-subscription cart shows free shipping | ⬜ | |
| 5.5 | Total calculation is correct (subtotal + shipping - promo) | ⬜ | |
| 5.6 | Placing order creates order + line items in database | ⬜ | |
| 5.7 | Thank you screen appears after successful order | ⬜ | |
| 5.8 | Cart clears after successful order | ⬜ | |
| 5.9 | Failed order_items insert deletes orphan order | ⬜ | |

---

## 6. Subscription Checkout

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Logged-out shopper with subscription in cart sees auth prompt | ⬜ | Cannot place order until signed in |
| 6.2 | After signing in, subscription creates correctly | ⬜ | |
| 6.3 | Mixed frequency subscriptions (4-week + 12-week) preserve each line's frequency | ⬜ | |
| 6.4 | My Subscriptions page shows created subscription | ⬜ | |
| 6.5 | Skip delivery pushes next_delivery_date forward | ⬜ | |
| 6.6 | Change frequency updates subscription | ⬜ | |

---

## 7. Account & Profile

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Sign up creates account and profile | ⬜ | |
| 7.2 | Sign in works | ⬜ | |
| 7.3 | Sign out works | ⬜ | |
| 7.4 | Profile page loads user data | ⬜ | |
| 7.5 | Update profile saves changes | ⬜ | |
| 7.6 | Password update works | ⬜ | |
| 7.7 | My Orders page shows user's orders | ⬜ | |
| 7.8 | Saved addresses work | ⬜ | |

---

## 8. Loyalty Program

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | Pack code scan (camera) extracts code and credits points | ⬜ | Requires authenticated user |
| 8.2 | Redeem loyalty gift works | ⬜ | Deducts points, records redemption |
| 8.3 | Redemption history shows completed redemptions | ⬜ | |
| 8.4 | Rate limit prevents abuse (too many attempts) | ⬜ | |

---

## 9. Free Sample

| # | Task | Status | Notes |
|---|---|---|---|
| 9.1 | Free sample form collects all required fields | ⬜ | |
| 9.2 | Submitting creates request in database | ⬜ | |
| 9.3 | Stock decrements atomically | ⬜ | Two concurrent requests can't over-decrement |
| 9.4 | Rate limit prevents abuse (max 5 per hour per IP) | ⬜ | |
| 9.5 | Out-of-stock samples show error message | ⬜ | |

---

## 10. Staff Dashboard (Operations)

| # | Task | Status | Notes |
|---|---|---|---|
| 10.1 | Staff dashboard loads (protected route) | ⬜ | Requires staff role |
| 10.2 | New orders appear in queue | ⬜ | |
| 10.3 | Free sample requests visible | ⬜ | |
| 10.4 | Gift redemptions visible | ⬜ | |
| 10.5 | Due subscriptions surface as tasks | ⬜ | Within N days |

---

## 11. Currency & Formatting

| # | Task | Status | Notes |
|---|---|---|---|
| 11.1 | All prices render as `900.000 ₫` (vi-VN format) | ⬜ | No `₫900,000` anywhere |
| 11.2 | Product card price correct | ⬜ | |
| 11.3 | Product page price correct | ⬜ | |
| 11.4 | Cart total correct | ⬜ | |
| 11.5 | Checkout total correct | ⬜ | |
| 11.6 | Wishlist price correct | ⬜ | |

---

## 12. Responsive & Mobile

| # | Task | Status | Notes |
|---|---|---|---|
| 12.1 | Homepage renders correctly on mobile viewport | ⬜ | |
| 12.2 | Cart sidebar works on mobile | ⬜ | |
| 12.3 | Checkout form usable on mobile | ⬜ | |
| 12.4 | Camera capture works on mobile | ⬜ | |
| 12.5 | Navigation/menu works on mobile | ⬜ | |

---

## 13. Error Handling

| # | Task | Status | Notes |
|---|---|---|---|
| 13.1 | Per-route error boundary catches crashes | ⬜ | Doesn't blank the whole app |
| 13.2 | Failed product fetch shows error message, not empty grid | ⬜ | |
| 13.3 | Auth modal opens on failed login attempt | ⬜ | |
| 13.4 | Network errors show user-friendly messages | ⬜ | |

---

## Summary

| Section | ✅ Passed | ❌ Failed | Total |
|---|---|---|---|
| 0. Environment Setup | | 7 | |
| 1. Browse & Discover | | 9 | |
| 2. Wishlist | | 7 | |
| 3. Cart | | 9 | |
| 4. Promo Codes | | 5 | |
| 5. Checkout | | 9 | |
| 6. Subscription Checkout | | 6 | |
| 7. Account & Profile | | 8 | |
| 8. Loyalty Program | | 4 | |
| 9. Free Sample | | 5 | |
| 10. Staff Dashboard | | 5 | |
| 11. Currency & Formatting | | 6 | |
| 12. Responsive & Mobile | | 5 | |
| 13. Error Handling | | 4 | |
| **Total** | | | **84** |

**Go/No-Go Decision:** All critical sections (0-9) must pass before showing the client. Sections 10-13 are nice-to-have but should ideally pass too.

---

*Run this checklist BEFORE Phase C (Client Demo). Fix any ❌ items before proceeding.*
