-- Fix RLS policies for orders and order_items tables to allow anonymous checkout

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;

-- Create new INSERT policy for orders table that allows both anonymous and authenticated users
CREATE POLICY "Allow anonymous and authenticated users to insert orders" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create new INSERT policy for order_items table that allows both anonymous and authenticated users  
CREATE POLICY "Allow anonymous and authenticated users to insert order items" ON public.order_items
FOR INSERT
TO anon, authenticated  
WITH CHECK (true);