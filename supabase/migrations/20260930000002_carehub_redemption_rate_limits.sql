-- ============================================================
-- CareHub: rate limiting for authenticated redemption endpoints
-- 2026-09-30
-- ============================================================
-- redeem-gift and redeem-loyalty-code are authenticated but not
-- rate-limited. This table lets the edge functions throttle per-user
-- redemptions to prevent abuse (e.g. brute-forcing loyalty codes).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.redemption_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemption_rate_limits_user_action_time
  ON public.redemption_rate_limits(user_id, action, created_at);

ALTER TABLE public.redemption_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage this table
DROP POLICY IF EXISTS "Service role full access on redemption_rate_limits" ON public.redemption_rate_limits;
CREATE POLICY "Service role full access on redemption_rate_limits"
  ON public.redemption_rate_limits FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Prevent direct user access to redemption_rate_limits" ON public.redemption_rate_limits;
CREATE POLICY "Prevent direct user access to redemption_rate_limits"
  ON public.redemption_rate_limits FOR ALL
  TO anon, authenticated
  USING (false) WITH CHECK (false);

GRANT ALL ON public.redemption_rate_limits TO service_role;
