-- ============================================================
-- CareHub: VERIFY + FIX anonymous order creation (idempotent)
-- 2026-09-21
-- ============================================================
-- Run ALL of this in Supabase SQL Editor. It:
--   1) shows the current INSERT policies on orders/order_items/promo_code_usages
--   2) creates any missing anon+authenticated INSERT policy (idempotent)
--   3) simulates a guest order insert as the anon role (the exact app call)
--   4) rolls back the test row so your data stays clean
-- If step 3 prints "TEST INSERT OK", the checkout will work.
-- ============================================================

-- ---------- 1) Current policies (diagnostic) ----------
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'order_items', 'promo_code_usages')
ORDER BY tablename, cmd;

-- ---------- 2) Ensure the INSERT policies exist (idempotent) ----------
DO $$
BEGIN
  -- orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='orders'
      AND cmd='INSERT' AND 'anon' = ANY(roles)
  ) THEN
    CREATE POLICY "Allow anon and authenticated insert orders"
      ON public.orders FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
    RAISE NOTICE 'created orders INSERT policy';
  ELSE
    RAISE NOTICE 'orders INSERT policy already present';
  END IF;

  -- order_items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='order_items'
      AND cmd='INSERT' AND 'anon' = ANY(roles)
  ) THEN
    CREATE POLICY "Allow anon and authenticated insert order_items"
      ON public.order_items FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
    RAISE NOTICE 'created order_items INSERT policy';
  ELSE
    RAISE NOTICE 'order_items INSERT policy already present';
  END IF;

  -- promo_code_usages
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='promo_code_usages'
      AND cmd='INSERT' AND 'anon' = ANY(roles)
  ) THEN
    CREATE POLICY "Allow anon and authenticated insert promo_code_usages"
      ON public.promo_code_usages FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
    RAISE NOTICE 'created promo_code_usages INSERT policy';
  ELSE
    RAISE NOTICE 'promo_code_usages INSERT policy already present';
  END IF;
END $$;

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT INSERT ON public.order_items TO anon, authenticated;
GRANT INSERT ON public.promo_code_usages TO anon, authenticated;

-- ---------- 3) Simulate the app's guest order insert as anon ----------
SET ROLE anon;
BEGIN;
  INSERT INTO public.orders
    (full_name, phone, email, address, city, ward, notes, total_amount, promo_code_applied, user_id)
  VALUES
    ('RLS Verify', '+85512345678', 'verify@test.com', 'Test St 1', 'Phnom Penh', '1', 'RLS verify', 100000, NULL, NULL)
  RETURNING 'TEST INSERT OK' AS result;
ROLLBACK;  -- undo the test row; data stays clean
RESET ROLE;

-- ---------- 4) Confirm final policy state ----------
SELECT tablename, policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders', 'order_items', 'promo_code_usages')
  AND cmd = 'INSERT'
ORDER BY tablename;