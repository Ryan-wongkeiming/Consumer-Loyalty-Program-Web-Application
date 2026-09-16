/*
  # Create loyalty gifts and redemptions system

  1. New Tables
    - `loyalty_gifts`
      - `id` (uuid, primary key)
      - `name` (text, gift name)
      - `description` (text, gift description)
      - `points_required` (integer, points needed to redeem)
      - `image_url` (text, gift image)
      - `stock` (integer, available quantity)
      - `is_active` (boolean, whether gift is available)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `loyalty_redemptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `gift_id` (uuid, foreign key to loyalty_gifts)
      - `points_spent` (integer, points deducted)
      - `status` (text, redemption status)
      - `redeemed_at` (timestamp)
      - `notes` (text, optional notes)

  2. Security
    - Enable RLS on both tables
    - Public can view active loyalty gifts
    - Only service_role can manage gifts
    - Users can view their own redemptions
    - Only service_role can create redemptions

  3. Sample Data
    - Insert attractive loyalty gifts with proper point values
    - Include high-quality Pexels images for each gift
*/

-- Create loyalty_gifts table
CREATE TABLE IF NOT EXISTS public.loyalty_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_required integer NOT NULL CHECK (points_required > 0),
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id uuid NOT NULL REFERENCES public.loyalty_gifts(id) ON DELETE CASCADE,
  points_spent integer NOT NULL CHECK (points_spent > 0),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  redeemed_at timestamptz DEFAULT now() NOT NULL,
  notes text
);

-- Enable RLS on loyalty_gifts
ALTER TABLE public.loyalty_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_gifts
-- Public can view active gifts
CREATE POLICY "Public can view active loyalty gifts" ON public.loyalty_gifts
FOR SELECT USING (is_active = true);

-- Only service_role can manage gifts
CREATE POLICY "Service role can manage loyalty gifts" ON public.loyalty_gifts
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on loyalty_redemptions
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_redemptions
-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON public.loyalty_redemptions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Only service_role can create/manage redemptions
CREATE POLICY "Service role can manage redemptions" ON public.loyalty_redemptions
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