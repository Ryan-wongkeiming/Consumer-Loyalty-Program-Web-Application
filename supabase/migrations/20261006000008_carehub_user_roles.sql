-- ============================================================
-- Phase B7: User roles for access control
-- 2026-10-06
-- ============================================================

-- Add role column to public.user_profiles (if exists) or create it on auth.users via trigger
-- Since we can't directly modify auth.users from migrations,
-- we'll use a separate table that syncs with auth.users

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON user_roles TO authenticated;

-- Function to get current user's role
DROP FUNCTION IF EXISTS public.get_current_user_role();
CREATE OR REPLACE FUNCTION public.get_current_user_role() RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT ur.role INTO v_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid();
    
    RETURN COALESCE(v_role, 'customer');
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- Function to update user role (for admin use)
DROP FUNCTION IF EXISTS public.set_user_role(p_user_id UUID, p_role TEXT);
CREATE OR REPLACE FUNCTION public.set_user_role(
    p_user_id UUID,
    p_role TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_role NOT IN ('customer', 'staff', 'admin') THEN
        RAISE EXCEPTION 'Invalid role: %. Must be customer, staff, or admin', p_role;
    END IF;
    
    INSERT INTO user_roles (user_id, role)
    VALUES (p_user_id, p_role)
    ON CONFLICT (user_id) DO UPDATE SET role = p_role, updated_at = NOW();
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role(UUID, TEXT) TO authenticated;
