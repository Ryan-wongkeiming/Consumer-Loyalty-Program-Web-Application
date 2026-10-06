-- ============================================================
-- Phase A4: Add tracking columns to orders table
-- 2026-10-06
-- ============================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_subscription_id ON public.orders(subscription_id) WHERE subscription_id IS NOT NULL;

COMMENT ON COLUMN public.orders.status IS 'Order lifecycle: pending -> confirmed -> processing -> shipped -> delivered';
COMMENT ON COLUMN public.orders.tracking_number IS 'Carrier tracking number (set when shipped)';
