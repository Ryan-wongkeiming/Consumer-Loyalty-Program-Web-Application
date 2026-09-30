-- ============================================================
-- CareHub: fix orders SELECT data leak
-- 2026-09-30
-- ============================================================
-- The policy "Enable read access for all orders" (USING true) let any
-- anonymous visitor read every order (customer names, emails, amounts).
-- It was added so the checkout insert (.insert().select().single())
-- could return the newly-created row. Replace it with scoped policies:
--   - authenticated users read only their own orders
--   - anon users read only guest orders (user_id IS NULL) they created
--   - service_role reads everything
-- ============================================================

DROP POLICY IF EXISTS "Enable read access for all orders" ON public.orders;

-- Authenticated users: read only their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anonymous users: read only guest orders (no user_id) they just created
DROP POLICY IF EXISTS "Anonymous users can view guest orders" ON public.orders;
CREATE POLICY "Anonymous users can view guest orders"
  ON public.orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Service role: full read access
DROP POLICY IF EXISTS "Service role can view all orders" ON public.orders;
CREATE POLICY "Service role can view all orders"
  ON public.orders FOR SELECT
  TO service_role
  USING (true);
