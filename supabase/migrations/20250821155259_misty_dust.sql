/*
  # Comprehensive RLS Policy Audit and Fixes

  1. Security Fixes
    - Fix overly permissive policies on orders and order_items
    - Ensure proper role-based access control
    - Add missing WITH CHECK clauses for INSERT/UPDATE operations
    - Enable RLS on public tables for consistency

  2. Tables Updated
    - orders: Fix INSERT/UPDATE policies for authenticated vs anonymous users
    - order_items: Ensure proper relationship validation
    - user_profiles: Strengthen user-specific access
    - user_addresses: Fix role-based access
    - wishlist: Ensure proper user ownership validation
    - messages: Strengthen content moderation policies
    - womens_health_products: Enable RLS for consistency
    - womens_health_product_skus: Enable RLS for consistency
    - articles: Enable RLS for consistency
    - topics: Enable RLS for consistency

  3. Security Principles Applied
    - Authenticated users can only access their own data
    - Anonymous users have limited INSERT access where appropriate
    - Service role has full administrative access
    - Public data is readable by everyone but only manageable by service role
*/

-- 1. Fix orders table policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Correct policies for orders
CREATE POLICY "Authenticated users can insert own orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can insert orders" ON public.orders
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated users can update own orders" ON public.orders
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Fix order_items table policies
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.order_items;

-- Correct policies for order_items
CREATE POLICY "Authenticated users can insert order items for own orders" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Anonymous users can insert order items for anonymous orders" ON public.order_items
FOR INSERT TO anon
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id IS NULL
));

-- 3. Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Authenticated users can view own profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Authenticated users can update own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Fix user_addresses table policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;

CREATE POLICY "Authenticated users can view own addresses" ON public.user_addresses
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own addresses" ON public.user_addresses
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own addresses" ON public.user_addresses
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own addresses" ON public.user_addresses
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 5. Fix wishlist table policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;

CREATE POLICY "Authenticated users can view own wishlist" ON public.wishlist
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own wishlist" ON public.wishlist
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own wishlist" ON public.wishlist
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own wishlist" ON public.wishlist
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 6. Fix messages table policies
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Authenticated users can view own and approved messages" ON public.messages
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_approved = true);

CREATE POLICY "Authenticated users can insert own messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own messages" ON public.messages
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own messages" ON public.messages
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 7. Enable RLS and add policies for public-facing tables
-- womens_health_products
ALTER TABLE public.womens_health_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view womens_health_products" ON public.womens_health_products;
CREATE POLICY "Public can view womens_health_products" ON public.womens_health_products
FOR SELECT USING (true);

CREATE POLICY "Service role can manage womens_health_products" ON public.womens_health_products
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- womens_health_product_skus
ALTER TABLE public.womens_health_product_skus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view womens_health_product_skus" ON public.womens_health_product_skus;
CREATE POLICY "Public can view womens_health_product_skus" ON public.womens_health_product_skus
FOR SELECT USING (true);

CREATE POLICY "Service role can manage womens_health_product_skus" ON public.womens_health_product_skus
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view articles" ON public.articles;
CREATE POLICY "Public can view articles" ON public.articles
FOR SELECT USING (true);

CREATE POLICY "Service role can manage articles" ON public.articles
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view topics" ON public.topics;
CREATE POLICY "Public can view topics" ON public.topics
FOR SELECT USING (true);

CREATE POLICY "Service role can manage topics" ON public.topics
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to loyalty_gifts
DROP TRIGGER IF EXISTS handle_loyalty_gifts_updated_at ON public.loyalty_gifts;
CREATE TRIGGER handle_loyalty_gifts_updated_at
  BEFORE UPDATE ON public.loyalty_gifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample loyalty gifts
INSERT INTO public.loyalty_gifts (name, description, points_required, image_url, stock, is_active)
VALUES
  ('Blackmores Premium Water Bottle', 'A high-quality, eco-friendly water bottle to encourage hydration.', 500, 'https://images.pexels.com/photos/1037993/pexels-photo-1037993.jpeg?auto=compress&cs=tinysrgb&w=800', 100, true),
  ('Exclusive Blackmores Sample Pack', 'A curated selection of new or popular product samples.', 500, 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800', 150, true),
  ('Digital Wellness Guide', 'An exclusive e-book on foundational nutrition and healthy living tips.', 500, 'https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('Blackmores Branded Wellness Journal', 'A beautifully designed journal for tracking health goals and mood.', 1500, 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800', 75, true),
  ('Aromatherapy Diffuser + Signature Blend', 'A compact diffuser with a custom essential oil blend for relaxation.', 1500, 'https://images.pexels.com/photos/3987130/pexels-photo-3987130.jpeg?auto=compress&cs=tinysrgb&w=800', 50, true),
  ('Premium Organic Tea Collection', 'A selection of high-quality organic herbal teas for health benefits.', 1500, 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=800', 80, true),
  ('Blackmores Immunity Boost Bundle', 'A full-sized bundle of complementary Blackmores products for immunity.', 3000, 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=800', 30, true),
  ('Virtual Wellness Workshop Access', 'Free enrollment in an exclusive online workshop with a nutritionist.', 3000, 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('High-Quality Yoga Mat', 'A durable and comfortable yoga mat for your fitness routine.', 3000, 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', 40, true),
  ('Personalized Health Consultation', 'A one-on-one virtual consultation with a certified health expert.', 5000, 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800', 10, true),
  ('Limited Edition Blackmores Product', 'An exclusive, high-value product not available for general purchase.', 5000, 'https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=800', 5, true),
  ('Luxury Natural Skincare Set', 'A set of premium, natural skincare products aligning with natural health.', 5000, 'https://images.pexels.com/photos/3987131/pexels-photo-3987131.jpeg?auto=compress&cs=tinysrgb&w=800', 15, true)
ON CONFLICT (id) DO NOTHING;