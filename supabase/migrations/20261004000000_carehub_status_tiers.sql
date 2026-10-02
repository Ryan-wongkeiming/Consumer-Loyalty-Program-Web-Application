-- ============================================================
-- CareHub: Status Tiers (Stage B)
-- 2026-10-04
-- ============================================================
-- Three tiers based on delivered spend or subscribed months:
--   Member    → default (0+ VND delivered)
--   Plus      → 2,000,000+ VND delivered OR 3+ active subscription months
--   Family    → 5,000,000+ VND delivered OR 6+ active subscription months
--
-- Tier benefits:
--   Plus: higher subscribe discount (+5%), earlier sample access
--   Family: highest subscribe discount (+10%), birthday gift, priority support
--
-- Computed automatically via SQL function; cached in user_profiles.tier.
-- ============================================================

-- ---------- Tier configuration table ----------
CREATE TABLE IF NOT EXISTS tier_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name TEXT NOT NULL UNIQUE CHECK (tier_name IN ('member', 'plus', 'family')),
    min_delivered_spend BIGINT NOT NULL DEFAULT 0,
    min_subscribed_months INTEGER NOT NULL DEFAULT 0,
    subscribe_discount_extra NUMERIC NOT NULL DEFAULT 0, -- extra % off subscribe price
    sample_access_early BOOLEAN NOT NULL DEFAULT false,
    birthday_gift BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed tier config
INSERT INTO tier_config (tier_name, min_delivered_spend, min_subscribed_months, subscribe_discount_extra, sample_access_early, birthday_gift)
VALUES
    ('member', 0, 0, 0, false, false),
    ('plus', 2000000, 3, 5, true, true),
    ('family', 5000000, 6, 10, true, true)
ON CONFLICT (tier_name) DO NOTHING;

-- ---------- Add tier column to user_profiles ----------
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'member'
    CHECK (tier IN ('member', 'plus', 'family'));

-- Add loyalty_level_display field for UI messaging
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS loyalty_level_display TEXT DEFAULT 'Thành viên';

-- ---------- Helper: compute tier from delivered spend ----------
DROP FUNCTION IF EXISTS public.compute_user_tier(UUID);

CREATE OR REPLACE FUNCTION public.compute_user_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_delivered BIGINT := 0;
    v_active_subs INTEGER := 0;
    v_current_tier TEXT;
    v_new_tier TEXT := 'member';
BEGIN
    -- Sum delivered order totals
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_delivered
    FROM orders
    WHERE user_id = p_user_id AND status = 'delivered';

    -- Count active subscriptions
    SELECT COUNT(*) INTO v_active_subs
    FROM subscriptions
    WHERE user_id = p_user_id AND status = 'active';

    -- Determine tier (check highest first)
    IF v_total_delivered >= 5000000 OR v_active_subs >= 6 THEN
        v_new_tier := 'family';
    ELSIF v_total_delivered >= 2000000 OR v_active_subs >= 3 THEN
        v_new_tier := 'plus';
    ELSE
        v_new_tier := 'member';
    END IF;

    RETURN v_new_tier;
END;
$$;

-- ---------- Main function: update tier + display text ----------
DROP FUNCTION IF EXISTS public.update_user_tier(UUID);

CREATE OR REPLACE FUNCTION public.update_user_tier(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_tier TEXT;
    v_old_tier TEXT;
    v_display TEXT;
BEGIN
    SELECT tier INTO v_old_tier FROM user_profiles WHERE id = p_user_id;
    
    v_new_tier := compute_user_tier(p_user_id);
    
    IF v_new_tier != v_old_tier THEN
        UPDATE user_profiles
        SET tier = v_new_tier,
            updated_at = NOW()
        WHERE id = p_user_id;

        -- Set display text
        CASE v_new_tier
            WHEN 'member' THEN v_display := 'Thành viên';
            WHEN 'plus' THEN v_display := 'Plus Member';
            WHEN 'family' THEN v_display := 'Family Member';
        END CASE;

        -- Update loyalty_level_display if column exists
        BEGIN
            EXECUTE format('UPDATE user_profiles SET loyalty_level_display = %L WHERE id = $1', v_display)
            USING p_user_id;
        EXCEPTION WHEN OTHERS THEN
            -- Column may not exist yet; skip silently
        END;

        RETURN jsonb_build_object(
            'success', true,
            'old_tier', v_old_tier,
            'new_tier', v_new_tier,
            'display', v_display
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'current_tier', v_new_tier,
        'no_change', true
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_tier(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_user_tier(UUID) TO anon, authenticated;

-- ---------- Trigger: auto-update tier when order is delivered ----------
-- Called after mark_order_delivered sets status='delivered'
DROP TRIGGER IF EXISTS on_order_delivered_tier_update ON orders;

CREATE OR REPLACE FUNCTION public.on_order_delivered_tier_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Recompute tier for the order's user
    PERFORM update_user_tier(NEW.user_id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_delivered_tier_update
AFTER UPDATE OF status ON orders
FOR EACH ROW
WHEN (NEW.status = 'delivered')
EXECUTE FUNCTION public.on_order_delivered_tier_trigger();

-- ---------- Progress tracking ----------
-- Show progress toward next tier on the loyalty page
DROP FUNCTION IF EXISTS public.get_tier_progress(UUID);

CREATE OR REPLACE FUNCTION public.get_tier_progress(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_delivered BIGINT := 0;
    v_active_subs INTEGER := 0;
    v_current_tier TEXT;
    v_next_tier TEXT;
    v_next_threshold BIGINT;
BEGIN
    SELECT tier INTO v_current_tier FROM user_profiles WHERE id = p_user_id;
    SELECT COALESCE(SUM(total_amount), 0) INTO v_total_delivered
    FROM orders WHERE user_id = p_user_id AND status = 'delivered';

    CASE v_current_tier
        WHEN 'member' THEN
            v_next_tier := 'plus';
            v_next_threshold := 2000000;
        WHEN 'plus' THEN
            v_next_tier := 'family';
            v_next_threshold := 5000000;
        ELSE
            v_next_tier := NULL;
            v_next_threshold := NULL;
    END CASE;

    RETURN jsonb_build_object(
        'current_tier', v_current_tier,
        'next_tier', v_next_tier,
        'delivered_spend', v_total_delivered,
        'next_threshold', v_next_threshold,
        'progress_pct', CASE WHEN v_next_threshold IS NOT NULL AND v_next_threshold > 0
                            THEN LEAST(100, ROUND(v_total_delivered::NUMERIC / v_next_threshold * 100))
                            ELSE 100 END
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_tier_progress(UUID) TO anon, authenticated;
