-- Fix RLS policies for orders and order_items tables to allow anonymous checkout

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;

-- Create new INSERT policies that properly allow anonymous and authenticated users
CREATE POLICY "Allow anon and authenticated insert orders" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated insert order_items" ON public.order_items
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);