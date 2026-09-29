-- ============================================================
-- CareHub: cleanup diagnostic test rows (safe, targeted)
-- 2026-09-21
-- ============================================================
-- Removes ONLY the rows created during RLS debugging so the
-- client demo starts clean. Also resets giadinhdaudau88's
-- usage counter (the trigger test incremented it to 1).
-- ============================================================

-- 1) Delete diagnostic test orders (cascades to order_items)
DELETE FROM public.orders
WHERE email IN (
  'curl@test.com',      -- Curl Test
  'curl3@test.com',     -- Curl T3
  'repr@test.com',      -- Curl Repr
  'simA@test.com',      -- Checkout Sim A
  'simB@test.com',      -- Checkout Sim B
  'js@test.com',        -- JS Sim (if any)
  'js2@test.com',       -- JS Sim2 (if any)
  'js3@test.com',       -- JS Sim3 (if any)
  'diag@test.com',      -- earlier diagnostics (if any)
  'test@test.com',      -- earliest trigger test (if any)
  'verify@test.com'     -- RLS verify (if any)
);

-- 2) Remove any promo_code_usages rows left by those test orders
DELETE FROM public.promo_code_usages
WHERE order_id NOT IN (SELECT id FROM public.orders);

-- 3) Reset the demo promo counter (trigger test incremented it)
UPDATE public.promo_codes
SET current_uses = 0
WHERE code = 'giadinhdaudau88';

-- 4) Show what remains (should be only real orders)
SELECT id, full_name, email, total_amount, created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;