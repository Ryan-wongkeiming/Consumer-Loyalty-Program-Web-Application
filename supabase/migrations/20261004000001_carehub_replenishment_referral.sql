-- ============================================================
-- CareHub: Replenishment by Life Stage + Referral (Stage B)
-- 2026-10-04
-- ============================================================
-- 1. Replenishment by life stage: store baby birth date from sample
--    form, suggest next stage/cadence based on age bands.
-- 2. Referral program: each account gets one referral code; when
--    a friend's first order is delivered, referrer earns points.
-- ============================================================

-- ---------- Baby age band table ----------
CREATE TABLE IF NOT EXISTS user_baby_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    baby_name TEXT,
    baby_birth_date DATE NOT NULL,
    current_stage TEXT CHECK (current_stage IN ('newborn', 'stage1', 'stage2', 'stage3', 'toddler')),
    consent_given BOOLEAN NOT NULL DEFAULT false,
    consent_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS for baby profiles (only owner can read/write)
ALTER TABLE user_baby_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own baby profile" ON user_baby_profiles;
CREATE POLICY "Users can view own baby profile" ON user_baby_profiles
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can manage own baby profile" ON user_baby_profiles;
CREATE POLICY "Users can manage own baby profile" ON user_baby_profiles
FOR ALL USING (user_id = auth.uid());

-- ---------- Stage recommendations ----------
-- Maps age in months to recommended product categories and cadence
DROP FUNCTION IF EXISTS public.get_replenishment_suggestions(UUID);

CREATE OR REPLACE FUNCTION public.get_replenishment_suggestions(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_baby_record user_baby_profiles%ROWTYPE;
    v_age_months INTEGER;
    v_suggestions JSONB := '[]'::jsonb;
BEGIN
    SELECT * INTO v_baby_record FROM user_baby_profiles WHERE user_id = p_user_id LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('has_profile', false, 'suggestions', v_suggestions);
    END IF;

    -- Calculate age in months
    v_age_months := EXTRACT(YEAR FROM AGE(NOW(), v_baby_record.baby_birth_date))::INTEGER * 12
                   + EXTRACT(MONTH FROM AGE(NOW(), v_baby_record.baby_birth_date))::INTEGER;

    -- Determine stage and cadence suggestion
    DECLARE
        v_stage TEXT;
        v_weeks INTEGER;
        v_message TEXT;
    BEGIN
        CASE
            WHEN v_age_months < 1 THEN
                v_stage := 'newborn';
                v_weeks := 4;
                v_message := 'Giúp bé làm quen với sữa công thức — giao mỗi 4 tuần';
            WHEN v_age_months < 6 THEN
                v_stage := 'stage1';
                v_weeks := 4;
                v_message := 'Giai đoạn tăng trưởng nhanh — giao mỗi 4 tuần';
            WHEN v_age_months < 12 THEN
                v_stage := 'stage2';
                v_weeks := 8;
                v_message := 'Giai đoạn ổn định — giao mỗi 8 tuần';
            ELSE
                v_stage := 'stage3';
                v_weeks := 12;
                v_message := 'Trẻ ăn dặm — giảm tần suất xuống mỗi 12 tuần';
        END CASE;

        -- Build suggestion array
        v_suggestions := jsonb_build_array(
            jsonb_build_object(
                'stage', v_stage,
                'age_months', v_age_months,
                'suggested_cadence_weeks', v_weeks,
                'message', v_message,
                'helps_you_reorder', true,
                'not_medical_advice', true
            )
        );
    END;

    RETURN jsonb_build_object(
        'has_profile', true,
        'baby_name', v_baby_record.baby_name,
        'age_months', v_age_months,
        'suggestions', v_suggestions
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_replenishment_suggestions(UUID) TO anon, authenticated;

-- ---------- Referral system ----------
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    used_by UUID REFERENCES auth.users(id),
    first_order_delivered BOOLEAN NOT NULL DEFAULT false,
    points_earned BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    redeemed_at TIMESTAMPTZ
);

-- Generate unique referral codes on insert
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_code TEXT;
    v_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    v_len INTEGER := 8;
BEGIN
    LOOP
        v_code := '';
        FOR i IN 1..v_len LOOP
            v_code := v_code || substring(v_chars from floor(random() * length(v_chars))::integer + 1 for 1);
        END LOOP;
        
        -- Ensure uniqueness
        IF NOT EXISTS (SELECT 1 FROM referral_codes WHERE referral_code = v_code) THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN v_code;
END;
$$;

ALTER TABLE referral_codes
ADD COLUMN IF NOT EXISTS generated_code TEXT NOT NULL DEFAULT generate_referral_code();

-- Add trigger to auto-generate code on insert
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code_on_create()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.generated_code := generate_referral_code();
    RETURN NEW;
END;
$$;

-- Create the trigger only if referral_codes table has user_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'referral_codes' AND column_name = 'user_id'
    ) THEN
        DROP TRIGGER IF EXISTS trg_auto_generate_referral_code ON referral_codes;
        CREATE TRIGGER trg_auto_generate_referral_code
        BEFORE INSERT ON referral_codes
        FOR EACH ROW
        WHEN (NEW.generated_code IS NULL OR NEW.generated_code = '')
        EXECUTE FUNCTION public.auto_generate_referral_code_on_create();
    END IF;
END $$;

-- RLS for referral codes
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code" ON referral_codes
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can manage referral codes" ON referral_codes
FOR ALL WITH CHECK (true);

-- ---------- Helper: credit referral points ----------
DROP FUNCTION IF EXISTS public.credit_referral_points(p_referrer_id UUID, p_order_id UUID);

CREATE OR REPLACE FUNCTION public.credit_referral_points(p_referrer_id UUID, p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_referral_referral referral_codes%ROWTYPE;
    v_points BIGINT := 100; -- Fixed bonus for successful referral
BEGIN
    -- Find the referral that led to this user
    SELECT * INTO v_referral_referral
    FROM referral_codes rc
    JOIN orders o ON o.user_id = rc.used_by AND o.id = p_order_id
    WHERE rc.user_id = p_referrer_id
      AND rc.first_order_delivered = false
    ORDER BY rc.created_at DESC
    LIMIT 1;

    IF FOUND THEN
        -- Credit points
        INSERT INTO user_loyalty_points (user_id, total_points, last_updated_at)
        VALUES (p_referrer_id, v_points, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            total_points = user_loyalty_points.total_points + v_points,
            last_updated_at = NOW();

        -- Mark referral as completed
        UPDATE referral_codes
        SET first_order_delivered = true, points_earned = v_points, redeemed_at = NOW()
        WHERE id = v_referral_referral.id;

        -- Log event
        INSERT INTO loyalty_point_events (user_id, order_id, points_earned, event_type, description)
        VALUES (p_referrer_id, p_order_id, v_points, 'referral_bonus',
                'Earned ' || v_points || ' points for referral');

        RETURN jsonb_build_object(
            'success', true,
            'points_earned', v_points,
            'referrer_id', p_referrer_id::text
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'reason', 'No matching referral found');
END;
$$;

GRANT EXECUTE ON FUNCTION public.credit_referral_points(UUID, UUID) TO anon, authenticated;
