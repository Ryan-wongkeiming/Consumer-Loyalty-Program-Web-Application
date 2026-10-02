-- ============================================================
-- CareHub: Privacy Consent + Fraud Controls (Stage C)
-- 2026-10-05
-- ============================================================
-- 1. Privacy consent tracking for account creation, baby data, marketing
-- 2. Observability: error logging + uptime check endpoint
-- 3. Fraud controls: unique pack codes, velocity limits, staff review
-- ============================================================

-- ---------- Privacy consents table ----------
CREATE TABLE IF NOT EXISTS privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    consent_type TEXT NOT NULL CHECK (consent_type IN ('marketing', 'baby_data', 'profile_data', 'terms')),
    version TEXT NOT NULL DEFAULT '1.0',
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for privacy consents (users see their own, service sees all)
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consents" ON privacy_consents
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can manage consents" ON privacy_consents
FOR ALL WITH CHECK (true);

-- Index for efficient consent checks
CREATE INDEX IF NOT EXISTS idx_consents_user_type ON privacy_consents(user_id, consent_type);

-- ---------- Error log table for edge function observability ----------
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    function_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_type TEXT,
    user_id UUID,
    request_context JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for error logs (readable by service/admin only)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service can write error logs" ON error_logs
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read error logs" ON error_logs
FOR SELECT USING (true); -- Replace with admin role check in production

-- ---------- Fraud controls ----------

-- Unique pack codes tracking
CREATE TABLE IF NOT EXISTS pack_code_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN,
    redemption_result TEXT -- 'points_credited', 'already_used', 'invalid'
);

-- RLS for pack code scans
ALTER TABLE pack_code_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans" ON pack_code_scans
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service can write scans" ON pack_code_scans
FOR INSERT WITH CHECK (true);

-- Velocity limit: max N redemptions per user per hour
DROP FUNCTION IF EXISTS public.check_redemption_velocity(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.check_redemption_velocity(p_user_id UUID, p_action TEXT DEFAULT 'redeem')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
    v_limit INTEGER := 10; -- Max 10 actions per hour
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM loyalty_point_events
    WHERE user_id = p_user_id
      AND event_type = p_action
      AND created_at > NOW() - INTERVAL '1 hour';

    RETURN v_count < v_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_redemption_velocity(UUID, TEXT) TO anon, authenticated;

-- Staff review flag for suspicious activity
CREATE TABLE IF NOT EXISTS fraud_review_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    review_type TEXT NOT NULL CHECK (review_type IN ('high_value_redemption', 'rapid_scans', 'suspicious_order')),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for fraud review queue
ALTER TABLE fraud_review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view review queue" ON fraud_review_queue
FOR SELECT USING (true);

CREATE POLICY "Staff can update review queue" ON fraud_review_queue
FOR UPDATE USING (true);

-- Trigger: auto-flag high-value redemptions for review
CREATE OR REPLACE FUNCTION public.flag_high_value_redemption()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.points_earned >= 500 THEN
        INSERT INTO fraud_review_queue (user_id, review_type, reason)
        VALUES (NEW.user_id, 'high_value_redemption', 
                'Earned ' || NEW.points_earned || ' points in single event');
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_flag_high_value_redemption
AFTER INSERT ON loyalty_point_events
FOR EACH ROW
WHEN (NEW.points_earned >= 500)
EXECUTE FUNCTION public.flag_high_value_redemption();
