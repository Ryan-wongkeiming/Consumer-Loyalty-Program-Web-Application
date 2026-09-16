-- Fix RLS policies for orders and order_items tables to allow anonymous checkout
-- This addresses the "new row violates row-level security policy" error

-- First, drop all existing policies on orders table
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable service role update/delete on orders" ON public.orders;

-- Drop all existing policies on order_items table
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable service role update/delete on order_items" ON public.order_items;

-- Create new comprehensive policies for orders table
-- Allow INSERT for both authenticated users and anonymous users
CREATE POLICY "Enable INSERT for all users" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow SELECT for users to read their own orders (authenticated) or service role
CREATE POLICY "Enable SELECT for own orders" ON public.orders
FOR SELECT 
TO authenticated, service_role
USING (
  (auth.uid() = user_id) OR 
  (auth.role() = 'service_role')
);

-- Allow UPDATE/DELETE only for service role
CREATE POLICY "Enable UPDATE/DELETE for service role" ON public.orders
FOR ALL 
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create new comprehensive policies for order_items table
-- Allow INSERT for both authenticated users and anonymous users
CREATE POLICY "Enable INSERT for all users" ON public.order_items
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow SELECT for users to read order items from their own orders or service role
CREATE POLICY "Enable SELECT for own order items" ON public.order_items
FOR SELECT 
TO authenticated, service_role
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.role() = 'service_role')
  )
);

-- Allow UPDATE/DELETE only for service role
CREATE POLICY "Enable UPDATE/DELETE for service role" ON public.order_items
FOR ALL 
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Ensure RLS is enabled on both tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';