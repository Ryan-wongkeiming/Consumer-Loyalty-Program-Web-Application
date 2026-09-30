# CareHub — Full Review, Diagnosis & Improvement Plan

_Date: 2026-09-30_
_Scope: full-project review (frontend, Supabase edge functions, database layer)_

## Overall assessment

The project is in **good shape**. Recent security and reliability work (RLS
fixes, Data API grants, atomic redemptions, join indexes) resolved the serious
issues. TypeScript compiles clean (`tsc --noEmit` passes). What remains is a set
of small bugs, code-quality issues, and worthwhile upgrades — no critical
problems.

Verification run for this review:
- `npm run lint` → 5 errors, 2 warnings (all minor; details below)
- `npx tsc --noEmit` → clean (no type errors)

---

## Bugs found

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| B1 | Medium | `src/lib/auth.ts` (~line 306) | `redeemLoyaltyCode` reads `result.message` on error, but the edge function returns `result.error`. Users get a generic message instead of the real one ("code already used", etc.). `redeemLoyaltyGift` correctly uses `result.error` — this one is inconsistent. |
| B2 | Low | 5 ESLint errors | Unused variables: `getBundleMultiplier` (BundleSelector.tsx), `formatPrice` + `subscriptionDiscount` (CartSidebar.tsx), `_deliveryFrequency` (pricing.ts), `formatPrice` (CheckoutPage.tsx). Dead code; harmless but fails `npm run lint`. |
| B3 | Low | `src/pages/CheckoutPage.tsx` (~line 102) | A local `formatPrice` shadows the imported one and uses `en-US` locale while the imported util uses `vi-VN`. Inconsistent currency formatting. |
| B4 | Low | `src/context/AuthContext.tsx` | `refreshProfile` runs on every `user` change via a second `useEffect`, causing a duplicate profile fetch on login (once in `signIn`, once from the effect). Minor extra request. |
| B5 | Low | app-wide | No React error boundary. If any page throws during render, the whole app shows a blank white screen. |

---

## Code-quality issues

- **Duplicate promo validation logic**: `src/data/promoCodes.ts` (anon query)
  and the `validate-promo` edge function do the same job. Two sources of truth
  that can drift.
- **No tests**: zero test files. The edge functions have subtle concurrency
  logic (atomic stock, code claiming) that would benefit from tests.
- **`console.log` in production**: `AuthContext` logs every auth state change
  and user email to the browser console. Minor privacy/noise issue.
- **Two Fast-Refresh warnings**: `AuthContext` and `CartContext` export
  non-component values alongside components.

---

## Enhancement opportunities

### Reliability & ops
1. **Add a React error boundary** — turns a blank-screen crash into a friendly
   "something went wrong" page.
2. **CI checks** — add a GitHub Action step that runs `npm run lint` and
   `tsc --noEmit` on push, so build-breaking issues are caught before deploy.
3. **Uptime monitoring** — a scheduled check hitting the site + Supabase REST
   endpoint, to catch outages early.

### Security
4. **Consolidate promo validation** — pick one path (the edge function is safer
   since it hides inactive codes) and remove the duplicate.
5. **Rate-limit the redemption endpoints** — `redeem-gift` /
   `redeem-loyalty-code` are authenticated but not rate-limited; add per-user
   throttling like the free-sample one.

### UX / performance
6. **Route-level code splitting** — the app loads one large JS bundle.
   Lazy-loading pages with `React.lazy` would speed up first load.
7. **Persist the cart** — cart state is in memory only; a refresh loses it.
   Save to `localStorage`.
8. **Loading/error states audit** — some data fetches (articles, topics)
   silently return `[]` on error, showing an empty page with no explanation.

---

## Proposed plan (phased)

### Phase 1 — Bug fixes (low risk, high value)
- Fix B1 (`result.error` in `redeemLoyaltyCode`).
- Fix B2 (remove 5 unused vars) and B3 (remove shadowed `formatPrice`).
- Remove production `console.log` of user email.
- **Result:** `npm run lint` passes clean.

### Phase 2 — Resilience
- Add a React error boundary (B5).
- Add a GitHub Action CI step for lint + type-check.
- Add `localStorage` cart persistence.

### Phase 3 — Consolidation & hardening
- Consolidate promo validation to one path.
- Add rate limiting to the redemption endpoints.
- Add route-level code splitting.

### Phase 4 — Testing (longer term)
- Add tests for the edge functions' concurrency logic and the pricing/cart
  reducers.

---

## Recommendation

Start with **Phase 1** — quick, safe, clears the lint errors plus the one real
user-facing bug (B1, wrong error messages on loyalty-code redemption).
Implement Phase 1 in one pass and verify in the browser before proceeding.

---

## Context: work already completed in prior sessions

These are done and pushed to `main`; listed here so the plan is self-contained.

- **Supabase Oct 30 Data API grants** — migration `20260928000000` + grants
  added to table-creating migrations and `rebuild_all.sql`.
- **RLS on `free_sample_requests`** — enabled with service-role-only access.
- **`orders` SELECT data leak fixed** — migration `20260930000000` replaced a
  `USING (true)` policy with scoped read policies.
- **Join-column indexes** — migration `20260929000000` to prevent PostgREST
  query timeouts as data grows.
- **Atomic redemptions** — migration `20260930000001` added `redeem_gift` and
  `redeem_loyalty_code` Postgres functions (single-transaction), a negative
  points guard, and a `free_sample_rate_limits` table; edge functions rewritten
  to call the RPCs; CORS tightened to the GitHub Pages origin.

### Outstanding manual step
- Delete 2 leftover test orders in the Supabase SQL Editor:
  ```sql
  DELETE FROM public.orders WHERE full_name LIKE 'RLS_TEST_MARKER%';
  ```
