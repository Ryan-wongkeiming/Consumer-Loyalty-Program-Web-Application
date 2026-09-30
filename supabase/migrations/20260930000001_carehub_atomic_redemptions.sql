-- ============================================================
-- CareHub: atomic redemption functions + negative-points guard
-- 2026-09-30
-- ============================================================
-- The edge functions redeem-gift and redeem-loyalty-code did several
-- writes with manual compensating rollbacks. If the process crashed
-- mid-way, the rollback never ran and state became inconsistent
-- (points deducted but gift not recorded, etc.). These functions run
-- the whole operation inside a single DB transaction, so either all
-- writes commit or none do.
-- ============================================================

-- ============================================================
-- 1. redeem_gift: atomically redeem a loyalty gift
--    - deduct points, decrement stock, record redemption
--    - all in one transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_gift(
  p_user_id uuid,
  p_gift_id uuid,
  p_shipping jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points integer;
  v_gift public.loyalty_gifts%ROWTYPE;
  v_redemption_id uuid;
BEGIN
  -- Lock the user's points row (or create it) to prevent concurrent redemption
  SELECT total_points INTO v_points
  FROM public.user_loyalty_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_loyalty_points (user_id, total_points)
    VALUES (p_user_id, 0)
    RETURNING total_points INTO v_points;
  END IF;

  -- Lock the gift row to prevent concurrent stock decrements
  SELECT * INTO v_gift
  FROM public.loyalty_gifts
  WHERE id = p_gift_id
  FOR UPDATE;

  IF NOT FOUND OR NOT v_gift.is_active THEN
    RAISE EXCEPTION 'Gift not found or inactive';
  END IF;

  IF v_gift.stock <= 0 THEN
    RAISE EXCEPTION 'Gift out of stock';
  END IF;

  IF v_points < v_gift.points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Deduct points
  UPDATE public.user_loyalty_points
  SET total_points = total_points - v_gift.points_required,
      last_updated_at = now()
  WHERE user_id = p_user_id;

  -- Decrement stock
  UPDATE public.loyalty_gifts
  SET stock = stock - 1,
      updated_at = now()
  WHERE id = p_gift_id;

  -- Record redemption
  INSERT INTO public.loyalty_redemptions (
    user_id, gift_id, points_spent, status, notes,
    full_name, phone, email, address, city, ward
  )
  VALUES (
    p_user_id, p_gift_id, v_gift.points_required, 'completed',
    'Đổi quà: ' || v_gift.name,
    p_shipping->>'full_name',
    p_shipping->>'phone',
    p_shipping->>'email',
    p_shipping->>'address',
    p_shipping->>'city',
    p_shipping->>'ward'
  )
  RETURNING id INTO v_redemption_id;

  RETURN jsonb_build_object(
    'success', true,
    'redemption_id', v_redemption_id,
    'gift_name', v_gift.name,
    'points_spent', v_gift.points_required,
    'remaining_points', v_points - v_gift.points_required
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_gift(uuid, uuid, jsonb) TO authenticated;

-- ============================================================
-- 2. redeem_loyalty_code: atomically claim a loyalty code and
--    credit points, in one transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.redeem_loyalty_code(
  p_user_id uuid,
  p_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code public.loyalty_codes%ROWTYPE;
  v_points integer;
BEGIN
  -- Lock the code row to prevent concurrent claims
  SELECT * INTO v_code
  FROM public.loyalty_codes
  WHERE code = p_code
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Code not found';
  END IF;

  IF v_code.is_redeemed OR v_code.redeemed_by_user_id IS NOT NULL THEN
    RAISE EXCEPTION 'Code already redeemed';
  END IF;

  -- Mark the code as redeemed
  UPDATE public.loyalty_codes
  SET is_redeemed = true,
      redeemed_by_user_id = p_user_id,
      redeemed_at = now()
  WHERE code = p_code;

  -- Lock the user's points row (or create it)
  SELECT total_points INTO v_points
  FROM public.user_loyalty_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_loyalty_points (user_id, total_points)
    VALUES (p_user_id, v_code.points)
    RETURNING total_points INTO v_points;
  ELSE
    UPDATE public.user_loyalty_points
    SET total_points = total_points + v_code.points,
        last_updated_at = now()
    WHERE user_id = p_user_id;
    v_points := v_points + v_code.points;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'code', p_code,
    'points', v_code.points,
    'total_points', v_points
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_loyalty_code(uuid, text) TO authenticated;

-- ============================================================
-- 3. Guard against negative loyalty points (safety net)
-- ============================================================
ALTER TABLE public.user_loyalty_points
  DROP CONSTRAINT IF EXISTS user_loyalty_points_total_points_nonneg;
ALTER TABLE public.user_loyalty_points
  ADD CONSTRAINT user_loyalty_points_total_points_nonneg
  CHECK (total_points >= 0);

-- ============================================================
-- 4. Rate limiting for anonymous endpoints (free sample requests)
--    Keyed by client IP so anonymous visitors can be throttled.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.free_sample_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_key text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_free_sample_rate_limits_key_time
  ON public.free_sample_rate_limits(client_key, window_start);

ALTER TABLE public.free_sample_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service_role can manage this table
DROP POLICY IF EXISTS "Service role full access on free_sample_rate_limits" ON public.free_sample_rate_limits;
CREATE POLICY "Service role full access on free_sample_rate_limits"
  ON public.free_sample_rate_limits FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Prevent direct user access to free_sample_rate_limits" ON public.free_sample_rate_limits;
CREATE POLICY "Prevent direct user access to free_sample_rate_limits"
  ON public.free_sample_rate_limits FOR ALL
  TO anon, authenticated
  USING (false) WITH CHECK (false);

GRANT ALL ON public.free_sample_rate_limits TO service_role;
