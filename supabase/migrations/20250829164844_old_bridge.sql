/*
  # Add sample_type_id to free_sample_requests table

  1. Changes
    - Add `sample_type_id` column to `free_sample_requests` table
    - Add foreign key constraint to reference `free_samples` table
    - Make the column optional to maintain compatibility with existing data

  2. Security
    - No RLS changes needed as the table already has appropriate policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_sample_requests' AND column_name = 'sample_type_id'
  ) THEN
    ALTER TABLE free_sample_requests ADD COLUMN sample_type_id text;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'free_sample_requests_sample_type_id_fkey'
  ) THEN
    ALTER TABLE free_sample_requests 
    ADD CONSTRAINT free_sample_requests_sample_type_id_fkey 
    FOREIGN KEY (sample_type_id) REFERENCES free_samples(id);
  END IF;
END $$;