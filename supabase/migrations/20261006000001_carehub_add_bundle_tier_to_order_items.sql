-- ============================================================
-- Add bundle_tier column to order_items table
-- 2026-10-06
-- ============================================================
-- The place_order RPC references this column but it was never
-- created in any prior migration. Adding now so checkout works.

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS bundle_tier JSONB;
