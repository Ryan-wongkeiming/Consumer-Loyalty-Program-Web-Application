-- ============================================================
-- CareHub: Challenges Calendar (Stage B)
-- 2026-10-04
-- ============================================================
-- Short-term challenges that reward points or samples.
-- Examples: scan 2 pack codes this month, keep one subscription
-- for 3 cycles. No game layer that hides products.
-- ============================================================

-- ---------- Challenge definitions (admin-configured) ----------
CREATE TABLE IF NOT EXISTS challenge_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pack_code_scans', 'subscription_streak', 'first_purchase', 'referral')),
    target_count INTEGER NOT NULL DEFAULT 1,
    reward_points BIGINT NOT NULL DEFAULT 0,
    reward_sample BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ, -- NULL = never expires
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default challenges
INSERT INTO challenge_definitions (name, description, type, target_count, reward_points, is_active)
VALUES
    ('Quét mã hộp tháng này', 'Quét ít nhất 2 mã pack code trong tháng', 'pack_code_scans', 2, 50, true),
    ('Giữ đăng ký 3 chu kỳ', 'Giữ một subscription liên tục cho 3 lần giao hàng', 'subscription_streak', 3, 200, true),
    ('Đơn hàng đầu tiên', 'Hoàn thành đơn hàng đầu tiên và nhận giao hàng', 'first_purchase', 1, 100, true);

-- RLS for challenge definitions (readable by all, writable by service)
ALTER TABLE challenge_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read challenges" ON challenge_definitions
FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Service can manage challenges" ON challenge_definitions
FOR ALL WITH CHECK (true);

-- ---------- User challenge progress ----------
CREATE TABLE IF NOT EXISTS user_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id UUID NOT NULL REFERENCES challenge_definitions(id) ON DELETE CASCADE,
    current_count INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, challenge_id)
);

-- RLS for user challenge progress
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON user_challenge_progress
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can manage progress" ON user_challenge_progress
FOR ALL WITH CHECK (true);

-- ---------- Helper: check and complete challenges ----------
DROP FUNCTION IF EXISTS public.check_and_complete_challenges(p_user_id UUID, p_type TEXT, p_increment INTEGER);

CREATE OR REPLACE FUNCTION public.check_and_complete_challenges(
    p_user_id UUID,
    p_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_challenge challenge_definitions%ROWTYPE;
    v_progress user_challenge_progress%ROWTYPE;
    v_points_earned BIGINT := 0;
    v_new_record BOOLEAN := false;
BEGIN
    -- Find active challenge matching type
    SELECT * INTO v_challenge
    FROM challenge_definitions
    WHERE type = p_type AND is_active = true
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'reason', 'No active challenge found for this type');
    END IF;

    -- Get or create progress record
    SELECT * INTO v_progress
    FROM user_challenge_progress
    WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

    IF NOT FOUND THEN
        -- Create new progress record
        INSERT INTO user_challenge_progress (user_id, challenge_id, current_count)
        VALUES (p_user_id, v_challenge.id, p_increment)
        RETURNING * INTO v_progress;
        v_new_record := true;
    ELSE
        -- Update existing progress
        UPDATE user_challenge_progress
        SET current_count = current_count + p_increment,
            updated_at = NOW()
        WHERE id = v_progress.id
        RETURNING * INTO v_progress;
    END IF;

    -- Check if challenge is now complete
    IF v_progress.current_count >= v_challenge.target_count AND NOT v_progress.is_completed THEN
        v_progress.is_completed := true;
        v_progress.completed_at := NOW();
        
        UPDATE user_challenge_progress
        SET is_completed = true, completed_at = NOW(), updated_at = NOW()
        WHERE id = v_progress.id;

        -- Credit rewards
        v_points_earned := v_challenge.reward_points;

        -- Award points
        IF v_points_earned > 0 THEN
            INSERT INTO user_loyalty_points (user_id, total_points, last_updated_at)
            VALUES (p_user_id, v_points_earned, NOW())
            ON CONFLICT (user_id) DO UPDATE SET
                total_points = user_loyalty_points.total_points + v_points_earned,
                last_updated_at = NOW();
        END IF;

        -- Log event
        INSERT INTO loyalty_point_events (user_id, points_earned, event_type, description)
        VALUES (p_user_id, v_points_earned, 'challenge_complete',
                'Completed challenge: ' || v_challenge.name);

        RETURN jsonb_build_object(
            'success', true,
            'challenge_completed', true,
            'challenge_name', v_challenge.name,
            'current_count', v_progress.current_count,
            'target_count', v_challenge.target_count,
            'points_earned', v_points_earned
        );
    END IF;

    -- Not yet complete
    RETURN jsonb_build_object(
        'success', true,
        'challenge_completed', false,
        'challenge_name', v_challenge.name,
        'current_count', v_progress.current_count,
        'target_count', v_challenge.target_count,
        'progress_pct', ROUND(v_progress.current_count::NUMERIC / v_challenge.target_count * 100)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_and_complete_challenges(UUID, TEXT, INTEGER) TO anon, authenticated;

-- ---------- Helper: get user's active challenges ----------
DROP FUNCTION IF EXISTS public.get_user_active_challenges(UUID);

CREATE OR REPLACE FUNCTION public.get_user_active_challenges(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB := '[]'::jsonb;
    v_challenge RECORD;
BEGIN
    FOR v_challenge IN
        SELECT cd.*, 
               ucp.current_count,
               ucp.is_completed,
               CASE WHEN cd.target_count > 0 
                    THEN LEAST(100, ROUND(ucp.current_count::NUMERIC / cd.target_count * 100))
                    ELSE 0 END as progress_pct
        FROM challenge_definitions cd
        LEFT JOIN user_challenge_progress ucp 
            ON ucp.challenge_id = cd.id AND ucp.user_id = p_user_id
        WHERE cd.is_active = true
          AND (ucp.is_completed = false OR ucp.is_completed IS NULL)
        ORDER BY cd.created_at DESC
    LOOP
        v_result := v_result || jsonb_build_array(
            jsonb_build_object(
                'id', v_challenge.id::text,
                'name', v_challenge.name,
                'description', v_challenge.description,
                'type', v_challenge.type,
                'target_count', v_challenge.target_count,
                'current_count', COALESCE(v_challenge.current_count, 0),
                'progress_pct', COALESCE(v_challenge.progress_pct, 0),
                'is_completed', COALESCE(v_challenge.is_completed, false),
                'reward_points', v_challenge.reward_points,
                'expires_at', v_challenge.expires_at
            )
        );
    END LOOP;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_active_challenges(UUID) TO anon, authenticated;
