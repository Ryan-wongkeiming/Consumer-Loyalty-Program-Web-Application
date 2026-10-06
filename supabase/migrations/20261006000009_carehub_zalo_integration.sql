-- ============================================================
-- Phase Z1+Z2: Zalo integration — OAuth login + ZNS log
-- 2026-10-06
-- ============================================================

-- Z1: Add Zalo identity fields to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS zalo_id TEXT UNIQUE;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS zalo_phone TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS zalo_avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_user_profiles_zalo_id ON public.user_profiles(zalo_id) WHERE zalo_id IS NOT NULL;

COMMENT ON COLUMN public.user_profiles.zalo_id IS 'Zalo user id from Zalo OAuth (used for login and OA messaging)';
COMMENT ON COLUMN public.user_profiles.zalo_phone IS 'Phone number returned by Zalo, used as ZNS target';

-- Z2: ZNS notification log table (audit trail of every Zalo message sent)
CREATE TABLE IF NOT EXISTS zns_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    template_type TEXT NOT NULL,
    phone TEXT,
    zalo_msg_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | sent | failed
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zns_log_order_id ON zns_log(order_id);
CREATE INDEX IF NOT EXISTS idx_zns_log_created_at ON zns_log(created_at DESC);

COMMENT ON TABLE zns_log IS 'Audit trail for Zalo ZNS template notifications';

GRANT SELECT, INSERT ON zns_log TO authenticated;

-- Helper RPC: upsert Zalo identity onto the current user profile
DROP FUNCTION IF EXISTS public.link_zalo_account(p_zalo_id TEXT, p_zalo_phone TEXT, p_zalo_avatar_url TEXT);
CREATE OR REPLACE FUNCTION public.link_zalo_account(
    p_zalo_id TEXT,
    p_zalo_phone TEXT,
    p_zalo_avatar_url TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_rec user_profiles%ROWTYPE;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    UPDATE public.user_profiles
    SET zalo_id = p_zalo_id,
        zalo_phone = p_zalo_phone,
        zalo_avatar_url = p_zalo_avatar_url,
        updated_at = NOW()
    WHERE id = v_user_id;

    SELECT * INTO v_rec FROM user_profiles WHERE id = v_user_id;
    RETURN row_to_json(v_rec)::jsonb;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_zalo_account(TEXT, TEXT, TEXT) TO authenticated;

-- Helper RPC: record a ZNS send attempt
DROP FUNCTION IF EXISTS public.log_zns(p_order_id UUID, p_template_type TEXT, p_phone TEXT, p_status TEXT, p_zalo_msg_id TEXT, p_error TEXT);
CREATE OR REPLACE FUNCTION public.log_zns(
    p_order_id UUID,
    p_template_type TEXT,
    p_phone TEXT,
    p_status TEXT,
    p_zalo_msg_id TEXT DEFAULT NULL,
    p_error TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO zns_log (order_id, user_id, template_type, phone, status, zalo_msg_id, error_message)
    VALUES (p_order_id, auth.uid(), p_template_type, p_phone, p_status, p_zalo_msg_id, p_error);
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_zns(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
