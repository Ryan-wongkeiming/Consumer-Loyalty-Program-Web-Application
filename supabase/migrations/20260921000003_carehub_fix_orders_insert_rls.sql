-- ============================================================
-- CareHub fix: anonymous order creation (RLS INSERT policy)
-- 2026-09-21
-- ============================================================
-- The order INSERT failed with:
--   42501 new row violates row-level security policy for table "orders"
-- because the live database has no INSERT policy covering the anon role.
-- Every INSERT policy in the migration history targets only
-- 'authenticated' (e.g. "Allow anon and authenticated insert orders"
-- has no TO anon) — so anon guests cannot place orders.
-- ============================================================

-- ---------- orders: allow anon + authenticated to insert ----------
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders_duplicate" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous users can insert orders" ON public.orders;

CREATE POLICY "Allow anon and authenticated insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ---------- order_items: allow anon + authenticated to insert ----------
-- (same defect; the app inserts order items right after the order)
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items_duplicate" ON public.order_items;
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow anonymous order items creation" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Anonymous users can insert order items" ON public.order_items;

CREATE POLICY "Allow anon and authenticated insert order_items"
  ON public.order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ---------- promo_code_usages: allow trigger inserts by any role ----------
-- The AFTER INSERT trigger on orders runs as the invoking role (anon).
-- Without an INSERT policy, the trigger's usage-row insert is also blocked.
DROP POLICY IF EXISTS "Allow anon and authenticated insert promo_code_usages" ON public.promo_code_usages;
DROP POLICY IF EXISTS "Enable insert for anon promo_code_usages" ON public.promo_code_usages;
CREATE POLICY "Allow anon and authenticated insert promo_code_usages"
  ON public.promo_code_usages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Grant the underlying privileges (belt-and-braces; policy alone suffices)
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT INSERT ON public.order_items TO anon, authenticated;
GRANT INSERT ON public.promo_code_usages TO anon, authenticated;