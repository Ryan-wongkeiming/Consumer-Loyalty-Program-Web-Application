-- Disable RLS on orders and order_items tables to allow anonymous checkout
-- This is a temporary fix to resolve the checkout issue

-- Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on order_items table  
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on orders table
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable service role update/delete on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow INSERT for anon and authenticated users" ON public.orders;

-- Drop all existing policies on order_items table
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable service role update/delete on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow INSERT for anon and authenticated users" ON public.order_items;

-- Note: With RLS disabled, all users can perform all operations on these tables
-- This resolves the immediate checkout issue but reduces security
-- Consider re-enabling RLS with proper policies once the issue is resolved