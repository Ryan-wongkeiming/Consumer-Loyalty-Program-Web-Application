-- Fix RLS policies for orders and order_items to allow anonymous checkout
-- This addresses the "new row violates row-level security policy" error

-- Drop existing INSERT policies that may be causing conflicts
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;

-- Create new INSERT policy for orders table that allows both authenticated and anonymous users
CREATE POLICY "Enable insert for authenticated and anonymous users" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create new INSERT policy for order_items table that allows both authenticated and anonymous users  
CREATE POLICY "Enable insert for authenticated and anonymous users" ON public.order_items
FOR INSERT
TO anon, authenticated  
WITH CHECK (true);

-- Ensure the policies are properly applied
NOTIFY pgrst, 'reload schema';