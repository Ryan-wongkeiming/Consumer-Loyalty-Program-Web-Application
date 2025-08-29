/*
  # Create Free Sample Stock Management System

  1. New Tables
    - `free_samples`
      - `id` (uuid, primary key)
      - `name` (text, sample type name)
      - `stock` (integer, available quantity)
      - `is_active` (boolean, whether sample is available)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `free_sample_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, nullable for anonymous)
      - `sample_type_id` (uuid, foreign key to free_samples)
      - `full_name` (text, requester's name)
      - `phone` (text, contact number)
      - `email` (text, optional email)
      - `baby_name` (text, optional baby name)
      - `baby_birth_date` (date, optional birth date)
      - `address` (text, delivery address)
      - `city` (text, city/province)
      - `ward` (text, ward/district)
      - `notes` (text, optional notes)
      - `status` (text, request status)
      - `requested_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Public can view active free samples
    - Only service_role can manage samples
    - Users can insert requests and view their own
    - Anonymous users can insert requests

  3. Sample Data
    - Insert initial stock for "Thanh số 1", "Thanh số 2", "Thanh số 3"
*/

-- Create free_samples table
CREATE TABLE IF NOT EXISTS public.free_samples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create free_sample_requests table
CREATE TABLE IF NOT EXISTS public.free_sample_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous requests
  sample_type_id uuid NOT NULL REFERENCES public.free_samples(id) ON DELETE RESTRICT,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  baby_name text,
  baby_birth_date date,
  address text NOT NULL,
  city text NOT NULL,
  ward text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  requested_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.free_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_sample_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for free_samples
CREATE POLICY "Public can view active free samples" ON public.free_samples
FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage free samples" ON public.free_samples
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for free_sample_requests
CREATE POLICY "Authenticated users can insert own free sample requests" ON public.free_sample_requests
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can insert free sample requests" ON public.free_sample_requests
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated users can view own free sample requests" ON public.free_sample_requests
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage free sample requests" ON public.free_sample_requests
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to free_samples
DROP TRIGGER IF EXISTS handle_free_samples_updated_at ON public.free_samples;
CREATE TRIGGER handle_free_samples_updated_at
  BEFORE UPDATE ON public.free_samples
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_free_samples_name ON public.free_samples(name);
CREATE INDEX IF NOT EXISTS idx_free_samples_active ON public.free_samples(is_active);
CREATE INDEX IF NOT EXISTS idx_free_sample_requests_user_id ON public.free_sample_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_free_sample_requests_sample_type_id ON public.free_sample_requests(sample_type_id);
CREATE INDEX IF NOT EXISTS idx_free_sample_requests_requested_at ON public.free_sample_requests(requested_at);

-- Insert initial sample data
INSERT INTO public.free_samples (name, stock, is_active) VALUES
  ('Thanh số 1', 50, true),
  ('Thanh số 2', 50, true),
  ('Thanh số 3', 50, true)
ON CONFLICT (name) DO NOTHING;

-- Grant necessary permissions to anon and authenticated roles
GRANT SELECT ON public.free_samples TO anon, authenticated;
GRANT INSERT ON public.free_sample_requests TO anon, authenticated;
GRANT SELECT ON public.free_sample_requests TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';