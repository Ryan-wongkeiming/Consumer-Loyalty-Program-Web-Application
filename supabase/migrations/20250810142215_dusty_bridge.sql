-- Fix RLS policy for orders table to allow anonymous users to create orders
-- This addresses the "new row violates row-level security policy" error

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;

-- Create a new policy that properly allows anonymous users to insert orders
-- This allows anyone (including anonymous users) to create orders
CREATE POLICY "Allow anonymous order creation" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also fix the order_items policy to match
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;

CREATE POLICY "Allow anonymous order items creation" ON public.order_items
FOR INSERT 
TO anon, authenticated  
WITH CHECK (true);