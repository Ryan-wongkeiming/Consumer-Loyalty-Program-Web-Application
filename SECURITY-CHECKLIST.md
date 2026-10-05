# CareHub — Security Checklist

Things to configure and verify before going live. This checklist prevents common security mistakes when setting up the Supabase backend.

---

## 1. Environment Variables

| # | Item | Status | Notes |
|---|---|---|---|
| 1.1 | `VITE_SUPABASE_URL` is set | ⬜ | Your Supabase project URL |
| 1.2 | `VITE_SUPABASE_ANON_KEY` is set | ⬜ | The anon public key — this is safe to expose publicly (RLS protects data) |
| 1.3 | `.env` file is git-ignored | ⬜ | Never commit real credentials |
| 1.4 | Service role key is stored in edge function environment variables only | ⬜ | Never in client code, never in `.env`, never in repo |
| 1.5 | OCR API key is stored in edge function environment variables only | ⬜ | Only needed by `ocr-processor` edge function |

---

## 2. Supabase Row Level Security (RLS)

All tables have RLS enabled. Verify policies are correct after migrations run.

### Products table

| # | Check | Expected policy |
|---|---|---|
| 2.1 | Anyone can read products | `FOR SELECT USING (TRUE)` |
| 2.2 | Only service_role can modify | `FOR ALL USING (auth.role() = 'service_role')` |

### Orders table

| # | Check | Expected policy |
|---|---|---|
| 2.3 | Anon + authenticated can INSERT orders | `TO anon, authenticated WITH CHECK (true)` |
| 2.4 | Authenticated users see only their own orders | `USING (user_id = auth.uid())` |
| 2.5 | Anon users see only guest orders they created | `USING (user_id IS NULL)` for anon role |
| 2.6 | No open INSERT policy allows arbitrary total_amount | Should be blocked; use `place_order` RPC instead |

### Order items table

| # | Check | Expected policy |
|---|---|---|
| 2.7 | Anon + authenticated can INSERT order items | `TO anon, authenticated WITH CHECK (true)` |
| 2.8 | Users can only read items from their own orders | Exists via join with orders table |

### Promo codes table

| # | Check | Expected policy |
|---|---|---|
| 2.9 | Anyone can read active, non-expired codes | `USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()))` |
| 2.10 | Only service_role can modify promo codes | `FOR ALL USING (auth.role() = 'service_role')` |

### Subscriptions table

| # | Check | Expected policy |
|---|---|---|
| 2.11 | Users can only access their own subscriptions | `USING (user_id = auth.uid())` |

### Wishlist table

| # | Check | Expected policy |
|---|---|---|
| 2.12 | Users can only manage their own wishlist | `USING (user_id = auth.uid())` |

### User profiles table

| # | Check | Expected policy |
|---|---|---|
| 2.13 | Users can view their own profile | `USING (id = auth.uid())` |
| 2.14 | Users can update their own profile | `WITH CHECK (id = auth.uid())` |

### Free sample rate limits table

| # | Check | Expected policy |
|---|---|---|
| 2.15 | Only service_role can manage rate limit records | `TO service_role` only |
| 2.16 | Anon/authenticated cannot access this table directly | `USING (false)` for anon/authenticated |

### Redemption rate limits table

| # | Check | Expected policy |
|---|---|---|
| 2.17 | Only service_role can manage redemption rate limit records | `TO service_role` only |
| 2.18 | Anon/authenticated cannot access this table directly | `USING (false)` for anon/authenticated |

---

## 3. Edge Functions Security

### CORS configuration

Each edge function restricts which origins can call it:

| Function | Allowed origin |
|---|---|
| `ocr-processor` | GitHub Pages origin + localhost in development |
| `redeem-gift` | GitHub Pages origin + localhost in development |
| `redeem-loyalty-code` | GitHub Pages origin + localhost in development |
| `request-free-sample` | GitHub Pages origin + localhost in development |

Verify these are configured as environment variables (`ALLOWED_ORIGIN`) rather than hardcoded, so you can change them without redeploying functions.

### Authentication requirements

| Function | Auth required? | Rate limited? |
|---|---|---|
| `ocr-processor` | Yes (bearer token) | Yes (per-user hourly cap) |
| `redeem-gift` | Yes (bearer token) | Yes (10/hour per user) |
| `redeem-loyalty-code` | Yes (bearer token) | Yes (10/hour per user) |
| `request-free-sample` | No (anon allowed) | Yes (5/hour per IP) |

---

## 4. Payment & Checkout Security

### Client-trusted prices

The `place_order` RPC computes prices server-side from the database, not from the client. This means:

- The client sends product IDs, quantities, and flags — NOT prices
- The RPC loads prices from the `products` table and recomputes totals
- A customer cannot manipulate the order total in the browser

**Before enabling any payment gateway**, confirm that `place_order` is the only path for order creation and that direct anon inserts into `orders` are blocked by RLS.

### COD confirmation queue

COD orders go through a staff confirmation step before shipping. This is the primary fraud prevention mechanism. Ensure:

- Staff dashboard shows all pending orders
- Confirmation process is documented (phone/Zalo/SMS/email template)
- Only confirmed orders are marked "shipped"

---

## 5. Data Privacy

### Personal data collection

CareHub collects the following personal data from customers:

| Data | Where collected | Purpose |
|---|---|---|
| Full name | Checkout form, free sample form | Delivery |
| Phone | Checkout form, free sample form | Contact for delivery confirmation |
| Email | Checkout form (optional), sign up | Order notifications |
| Address | Checkout form, free sample form | Delivery |
| Baby birth date | Free sample form | Replenishment suggestions (with consent) |
| Loyalty points | Pack-code scanning | Rewards program |

### Consent tracking

When personal data is collected, record:
- What data was collected
- When it was collected
- How it will be used (marketing, replenishment, etc.)
- Whether the user consented

This supports Vietnam's personal data protection requirements.

### Data retention

Decide how long to keep:
- Order history (recommend: indefinite for loyalty purposes)
- Free sample requests (recommend: delete after fulfillment + 90 days)
- Deleted account data (recommend: anonymize after 30 days)

---

## 6. Infrastructure Security

### GitHub Pages

| # | Check | Notes |
|---|---|---|
| 6.1 | Repository is private during development | Make public only when ready for client demo |
| 6.2 | Branch protection on main branch | Require PR review before merging |
| 6.3 | GitHub Actions secrets are configured | VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |
| 6.4 | No secrets in .env.production | Only anon key (which is public by design) |

### Supabase

| # | Check | Notes |
|---|---|---|
| 7.1 | Database backups enabled | Supabase free tier includes automatic daily backups |
| 7.2 | Email provider enabled | For user authentication |
| 7.3 | Storage bucket policies correct | `product-images` bucket: public read, authenticated write/delete |
| 7.4 | API rate limiting configured | Supabase has built-in rate limits; adjust if needed |

### Edge Functions

| # | Check | Notes |
|---|---|---|
| 8.1 | All secrets in function env vars | Not in code, not committed to repo |
| 8.2 | CORS restricted to production domain | Allow localhost only in development |
| 8.3 | Error messages don't leak internal details | No stack traces or SQL errors exposed to clients |

---

## 7. Pre-launch Verification

Run through these checks before going live:

- [ ] Direct anon INSERT into orders returns 42501 (RLS blocks it)
- [ ] Place_order RPC works for both guest and authenticated users
- [ ] Promo codes validate correctly (case-insensitive lookup, brand restrictions)
- [ ] Free sample rate limit prevents abuse
- [ ] Redeem endpoints reject unauthenticated requests
- [ ] All images hosted in Supabase Storage (no external hotlinks)
- [ ] Console.log statements removed (except error logging)
- [ ] No test orders or debug data in production database
- [ ] Error boundaries catch crashes gracefully
- [ ] 404 page works for deep links on GitHub Pages

---

## 8. Incident Response

If something goes wrong:

### Customer data breach suspected
1. Rotate Supabase anon key (Project Settings → API → Regenerate anon key)
2. Investigate which data was exposed
3. Notify affected customers if required by law
4. Fix the vulnerability

### Edge function compromised
1. Disable the affected function (Supabase → Edge Functions → toggle off)
2. Rotate the affected secret in function environment variables
3. Investigate logs for unauthorized usage
4. Fix the vulnerability

### Database issue
1. Restore from backup (Supabase Dashboard → Settings → Database → Backup)
2. Identify the cause
3. Apply fix
4. Test restore

---

*Review this checklist with your team before going live. Mark each item as verified.*
