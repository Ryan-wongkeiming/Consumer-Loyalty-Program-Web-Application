/*
  # Create Loyalty System Tables

  1. New Tables
    - `loyalty_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null)
      - `points` (integer, not null)
      - `is_redeemed` (boolean, default false)
      - `redeemed_by_user_id` (uuid, foreign key to auth.users)
      - `redeemed_at` (timestamptz, nullable)
    
    - `user_loyalty_points`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `total_points` (integer, default 0)
      - `last_updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
    - Service role has full access for backend operations
    - Users can only view their own loyalty points

  3. Sample Data
    - Insert sample loyalty codes for testing
*/

-- Create loyalty_codes table
CREATE TABLE IF NOT EXISTS loyalty_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  is_redeemed boolean DEFAULT false NOT NULL,
  redeemed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_loyalty_points table
CREATE TABLE IF NOT EXISTS user_loyalty_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0 NOT NULL CHECK (total_points >= 0),
  last_updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE loyalty_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loyalty_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_codes
CREATE POLICY "Service role full access on loyalty_codes"
  ON loyalty_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Prevent direct user access to loyalty_codes"
  ON loyalty_codes
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- RLS Policies for user_loyalty_points
CREATE POLICY "Service role full access on user_loyalty_points"
  ON user_loyalty_points
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own loyalty points"
  ON user_loyalty_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update last_updated_at
CREATE OR REPLACE FUNCTION handle_loyalty_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp update
DROP TRIGGER IF EXISTS handle_loyalty_points_updated_at ON user_loyalty_points;
CREATE TRIGGER handle_loyalty_points_updated_at
  BEFORE UPDATE ON user_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_loyalty_points_updated_at();

-- Insert sample loyalty codes for testing
INSERT INTO loyalty_codes (code, points) VALUES
  ('BLACKMORES2025', 100),
  ('HEALTH50', 50),
  ('WELLNESS25', 25),
  ('VITAMIN100', 100),
  ('NATURAL75', 75),
  ('IMMUNITY30', 30),
  ('ENERGY40', 40),
  ('CALCIUM60', 60),
  ('OMEGA80', 80),
  ('PROBIOTIC45', 45)
ON CONFLICT (code) DO NOTHING;