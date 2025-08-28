/*
  # Create OCR Rate Limits Table

  1. New Tables
    - `ocr_rate_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `request_count` (integer, number of requests)
      - `created_at` (timestamp, when the rate limit entry was created)

  2. Security
    - Enable RLS on `ocr_rate_limits` table
    - Add policies for service role access only
    - Add index for efficient rate limit queries

  3. Purpose
    - Track OCR API usage per user to prevent abuse
    - Implement rate limiting for the camera capture feature
*/

-- Create the OCR rate limits table
CREATE TABLE IF NOT EXISTS public.ocr_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ocr_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ocr_rate_limits table
CREATE POLICY "Enable service role full access on ocr_rate_limits"
ON public.ocr_rate_limits FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Prevent direct access by regular users (only service role should manage this)
CREATE POLICY "Prevent direct user access to ocr_rate_limits"
ON public.ocr_rate_limits FOR ALL
TO authenticated, anon
USING (false) WITH CHECK (false);

-- Create indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_user_id ON public.ocr_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_created_at ON public.ocr_rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_user_time ON public.ocr_rate_limits(user_id, created_at);