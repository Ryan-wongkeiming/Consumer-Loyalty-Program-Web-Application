/*
  # Add foreign key relationship between messages and user_profiles

  1. Changes
    - Add foreign key constraint on messages.user_id referencing user_profiles.id
    - This enables Supabase to properly join messages with user_profiles data

  2. Security
    - No RLS changes needed as existing policies remain intact
*/

-- Add foreign key constraint to establish relationship between messages and user_profiles
DO $$
BEGIN
  -- Check if the foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_user_id_user_profiles_fkey'
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_user_id_user_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;