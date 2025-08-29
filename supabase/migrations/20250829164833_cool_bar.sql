/*
  # Create free_samples table

  1. New Tables
    - `free_samples`
      - `id` (text, primary key) - unique identifier for sample type
      - `name` (text) - display name of the sample
      - `description` (text, optional) - description of the sample
      - `stock` (integer) - available stock count
      - `is_active` (boolean) - whether the sample is currently available
      - `created_at` (timestamp) - when the sample type was created
      - `updated_at` (timestamp) - when the sample type was last updated

  2. Security
    - Enable RLS on `free_samples` table
    - Add policy for public read access to active samples
    - Add policy for service role full access

  3. Sample Data
    - Insert initial sample types with stock
*/

CREATE TABLE IF NOT EXISTS free_samples (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE free_samples ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active free samples"
  ON free_samples
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role full access on free_samples"
  ON free_samples
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO free_samples (id, name, description, stock, is_active) VALUES
  ('blackmores-pregnancy-gold', 'Blackmores Pregnancy & Breast-feeding Gold', 'Vitamin tổng hợp cho mẹ bầu và cho con bú', 100, true),
  ('blackmores-kids-multi', 'Blackmores Kids Multi', 'Vitamin tổng hợp cho trẻ em', 50, true)
ON CONFLICT (id) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'handle_free_samples_updated_at'
  ) THEN
    CREATE TRIGGER handle_free_samples_updated_at
      BEFORE UPDATE ON free_samples
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;