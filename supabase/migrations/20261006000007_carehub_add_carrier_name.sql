-- ============================================================
-- Phase A7: Add carrier_name to orders + RLS policies
-- 2026-10-06
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS carrier_name TEXT;

COMMENT ON COLUMN public.orders.carrier_name IS 'Delivery carrier (Lalamove, Viettel Post, VNPost)';
