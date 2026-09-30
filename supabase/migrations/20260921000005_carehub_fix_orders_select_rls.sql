-- ============================================================
-- CareHub: show ALL policies on orders (SELECT especially) + fix
-- 2026-09-21
-- ============================================================
-- The app's insert uses .select().single() which sends
-- Prefer: return=representation. PostgREST then needs a SELECT
-- policy for the anon role to return the row. If anon has no
-- SELECT policy on orders, the insert is rolled back with
-- "new row violates row-level security policy".
-- ============================================================

-- ---------- 1) See ALL policies on orders (every command) ----------
SELECT policyname, cmd, roles::text, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY cmd;

-- ---------- 2) Ensure anon + authenticated can SELECT orders ----------
-- Scoped: authenticated users read only their own orders; anon users read
-- only guest orders (user_id IS NULL) they just created. This lets the
-- checkout insert (.insert().select().single()) return the new row without
-- exposing other customers' orders.
DROP POLICY IF EXISTS "Enable read access for all orders" ON public.orders;
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Anonymous users can view guest orders"
  ON public.orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- ---------- 3) Confirm the SELECT policy now exists ----------
SELECT policyname, cmd, roles::text
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders'
  AND cmd = 'SELECT'
ORDER BY policyname;