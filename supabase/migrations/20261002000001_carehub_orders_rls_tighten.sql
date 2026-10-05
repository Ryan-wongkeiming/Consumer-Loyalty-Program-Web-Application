-- ============================================================
-- CareHub: Tighten RLS on orders / order_items
-- 2026-10-02
-- ============================================================
-- Remove anon INSERT policy so guests cannot insert arbitrary rows
-- directly into orders or order_items. Guest checkout must go
-- through place_order() RPC only.
-- ============================================================

-- Drop permissive anon INSERT policies on orders
DROP POLICY IF EXISTS "Allow anon insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;

-- Remove any remaining WITH CHECK (true) policy that allows anon to insert
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'orders'
          AND cmd = 'INSERT'
          AND (policyqual IS NULL OR policyqual::text = 'true')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', rec.policyname);
    END LOOP;
END $$;

-- Same for order_items
DROP POLICY IF EXISTS "Allow anon insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON public.order_items;
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'order_items'
          AND cmd = 'INSERT'
          AND (policyqual IS NULL OR policyqual::text = 'true')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', rec.policyname);
    END LOOP;
END $$;

-- Keep SELECT accessible for anon (they need to see their own orders via filters)
-- Only INSERT is removed. UPDATE/DELETE remain restricted to authenticated users.

-- Verify place_order is callable by anon
GRANT EXECUTE ON FUNCTION public.place_order(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID
) TO anon, authenticated;
