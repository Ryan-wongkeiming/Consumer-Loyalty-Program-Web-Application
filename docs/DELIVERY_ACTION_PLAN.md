# CareHub — Delivery Action Plan

**Created:** 2026-10-02
**Status:** Preparing for client demo
**Context:** Project will be packaged and handed over to a completely new team. Demo/testing stage. Client has not yet seen the output.

---

## Phase A: Pre-Demo Preparation

| # | Task | Status | Notes |
|---|---|---|---|
| A1 | Create `DEMO-CHECKLIST.md` — verify every flow end-to-end | ✅ Done | 84 checks across 13 sections |
| A2 | Clean repo — remove test files, debug comments, leftover markers | ✅ Done | Removed 3 test scripts with hardcoded creds, removed console.log in AuthContext |
| A3 | Confirm `.env.example` has no real credentials | ✅ Done | Verified clean |
| A4 | Write `README.md` — what CareHub is, tech stack, brands | ✅ Done | |
| A5 | Write `QUICKSTART.md` — 5-minute local setup guide | ✅ Done | |
| A6 | Write `DEPLOYMENT-GUIDE.md` — how to host independently | ✅ Done | GitHub Pages + Vercel/Netlify alternatives |
| A7 | Write `DATABASE-MIGRATION-GUIDE.md` — set up Supabase from scratch | ✅ Done | Fresh DB + incremental migrations + full migration list |
| A8 | Write `ADMIN-OPERATIONS-GUIDE.md` — staff dashboard, orders, promos, samples | ✅ Done | Complete operations manual |
| A9 | Write `SECURITY-CHECKLIST.md` — RLS, env vars, CORS, service role key | ✅ Done | 20+ policy checks + pre-launch verification |
| A10 | Write `KNOWN-LIMITATIONS.md` — transparent gaps before handover | ✅ Done | 7 categories of limitations documented |

## Phase B: Self-Test (Follow QUICKSTART.md from Scratch)

| # | Task | Status | Notes |
|---|---|---|---|
| B1 | Clone fresh copy → follow QUICKSTART.md → run locally | ⬜ Pending | Must succeed without any extra instructions |
| B2 | Verify all flows work in local environment | ⬜ Pending | Browse, filter, search, add to cart, checkout, account, loyalty, free sample |
| B3 | Run lint + tsc + build on fresh clone | ⬜ Pending | |

## Phase C: Client Demo

| # | Task | Status | Notes |
|---|---|---|---|
| C1 | Present working demo to client | ⬜ Pending | Use live dev server or deployed preview |
| C2 | Walk through features they care about most | ⬜ Pending | Based on their feedback during demo |
| C3 | Collect client feedback and approval status | ⬜ Pending | Approved / Feedback required / Not approved |
| C4 | Address any client feedback items | ⬜ Pending | Only if feedback requires changes |

## Phase D: Handover Package

| # | Task | Status | Notes |
|---|---|---|---|
| D1 | Assemble `CareHub-Delivery/` folder with all docs | ⬜ Pending | After client approval |
| D2 | Remove internal/dev-only files from deliverable | ⬜ Pending | |
| D3 | Final review of delivery package | ⬜ Pending | |
| D4 | Deliver source code + documentation to client | ⬜ Pending | |
| D5 | Walk through QUICKSTART.md with their developers | ⬜ Pending | |

---

## Current State

- **Git branch:** main
- **Latest commit:** `9a20bbd` — feat: delivery carrier selection in checkout with env-controlled enable/disable
- **Total commits ahead of origin/main:** 10
- **Working tree:** clean
- **Client status:** Not yet shown anything
- **Demo status:** Not scheduled

## Recent Commits (Since Delivery Prep Started)

| Commit | Description |
|---|---|
| `9a20bbd` | feat: delivery carrier selection UI + env config for Lalamove/Viettel Post/VNPost |
| `25b74d8` | fix: camera race condition + delivery services abstraction layer |
| `5d61cdc` | fix: 6 migration correctness fixes (PG compat, idempotency) |
| `9a90849` | docs: delivery package preparation — README, quickstart, deployment guides, etc. |

## Open Decisions

| Decision | Value | Owner | Date |
|---|---|---|---|
| Standard shipping fee | 30,000 VND with configurable freeship mechanism | Client | 2026-10-02 |
| Promo code canonical case | Normalize to uppercase on write, compare case-insensitively on read | Dev | 2026-10-02 |
| Free shipping threshold | No threshold; only all-subscription orders ship free | Client (default) | 2026-10-02 |

---

## Notes for Later (Don't Forget)

### Delivery fees — update when contracts are signed

Default shipping rates in `src/data/deliveryServices.ts` are placeholders:

```
Lalamove = 35,000 VND  (urban same-day, 2-4 hours)
Viettel Post = 25,000 VND  (nationwide, 2-4 days)
VNPost = 18,000 VND  (cheapest, 3-5 days)
```

After signing contracts, change these three numbers to your actual contract rates. In production, replace them with live API calls that calculate prices based on distance and package size.

### Enable/disable carriers without code changes

Three lines in `.env` control which carriers appear at checkout:

```
VITE_ENABLE_LALAMOVE=true
VITE_ENABLE_VIETTEL_POST=true
VITE_ENABLE_VNPOST=true
```

Set any to `false` and that carrier disappears from checkout. No code editing needed.

---

## How to Browse and See Results

To see the camera fix and delivery carrier selection in action:

**Step 1:** Start the dev server
```bash
npm run dev
```

**Step 2:** Open in browser
```
http://localhost:5173/Consumer-Loyalty-Program-Web-Application/
```

**Step 3 — Test camera fix:**
- Go to the Cart page or Loyalty page
- Tap the camera icon next to the promo code input
- Grant camera permission when prompted
- Video should play immediately (no blank screen)
- Tap "Chụp" to capture
- The scanned code auto-applies

**Step 4 — Test carrier selection:**
- Add products to cart
- Go to Checkout page
- Scroll to "Phương thức giao hàng" section
- You should see three selectable cards: Lalamove, Viettel Post, VNPost
- Click different carriers — the shipping fee in the order summary updates
- All-subscription carts show "Miễn phí" for all carriers

---

*This file is the shared checkpoint between you and the assistant. Update status as tasks complete.*
