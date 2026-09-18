-- CareHub: Subscription engine (Option A — confirmed-repeat, COD-friendly)
--
-- Mirrors the Blackmores Subscribe mechanism, adapted for a COD-first market:
--   - Subscription requires an account (user_id)
--   - Frequency sets the repeat cadence (4/8/12 weeks) — the price is flat
--   - Each cycle is CONFIRMED with the customer before shipping (opt-in per
--     cycle, unlike Blackmores' opt-out-by-deadline card auto-charge)
--   - Customer can skip / pause / cancel / change frequency anytime
--   - Out-of-stock or non-confirmation -> cycle skipped/paused, never auto-billed
--
-- Key Blackmores rules reused verbatim:
--   - Voucher codes cannot be used on subscription orders
--   - Price changes need >= 14 days notice; customer can cancel penalty-free
--   - Failed payment/confirmation -> retry, then pause (never silent-charge)

-- ============================================================
-- 1. subscriptions table (one row per active subscription)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled')),
  frequency_weeks INTEGER NOT NULL DEFAULT 4
    CHECK (frequency_weeks IN (4, 8, 12)),
  next_delivery_date DATE,
  last_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. Subscription items (products + quantity in the subscription)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  is_subscription BOOLEAN DEFAULT TRUE,
  delivery_frequency TEXT,
  bundle_tier JSONB
);

-- ============================================================
-- 3. orders.subscription_id — link an order to its subscription
-- ============================================================
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id);

-- ============================================================
-- 4. RLS: users manage only their own subscriptions
-- ============================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own subscriptions" ON public.subscriptions;
CREATE POLICY "Users update own subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own subscription items" ON public.subscription_items;
CREATE POLICY "Users view own subscription items"
  ON public.subscription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_items.subscription_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own subscription items" ON public.subscription_items;
CREATE POLICY "Users insert own subscription items"
  ON public.subscription_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_items.subscription_id
        AND s.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update own subscription items" ON public.subscription_items;
CREATE POLICY "Users update own subscription items"
  ON public.subscription_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_items.subscription_id
        AND s.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_items.subscription_id
        AND s.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. Trigger: keep updated_at fresh
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "subscriptions_set_updated_at" ON public.subscriptions;
CREATE TRIGGER "subscriptions_set_updated_at"
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_subscription_updated_at();

-- ============================================================
-- Verify
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('subscriptions', 'subscription_items', 'orders')
ORDER BY table_name, ordinal_position;