/*
  # Add shipping columns to loyalty_redemptions table

  1. Schema Changes
    - Add `full_name` column to store recipient's full name
    - Add `phone` column to store recipient's phone number
    - Add `email` column to store recipient's email (nullable)
    - Add `address` column to store street address
    - Add `city` column to store city/province
    - Add `ward` column to store ward/district

  2. Purpose
    - Enable storing complete shipping information for gift redemptions
    - Support the gift redemption confirmation flow
    - Ensure proper delivery of redeemed loyalty gifts
*/

-- Add shipping columns to loyalty_redemptions table
DO $$
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN full_name text;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'phone'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN phone text;
  END IF;

  -- Add email column if it doesn't exist (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'email'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN email text;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'address'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN address text;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'city'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN city text;
  END IF;

  -- Add ward column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'ward'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN ward text;
  END IF;
END $$;