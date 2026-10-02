-- ============================================================
-- CareHub: Atomic free sample claim function
-- 2026-10-02
-- ============================================================
-- Replaces the read → decrement → insert → compensating rollback
-- pattern with a single SQL function that:
--   1. Locks the sample row (FOR UPDATE)
--   2. Checks stock > 0
--   3. Decrements stock
--   4. Inserts the request
-- All in one transaction. Fails closed if stock check fails.
-- ============================================================

DROP FUNCTION IF EXISTS public.claim_free_sample(
    p_full_name TEXT, p_phone TEXT, p_email TEXT,
    p_address TEXT, p_city TEXT, p_ward TEXT,
    p_baby_name TEXT, p_baby_birth_date DATE,
    p_notes TEXT, p_sample_type_id UUID
);

CREATE OR REPLACE FUNCTION public.claim_free_sample(
    p_full_name TEXT, p_phone TEXT, p_email TEXT,
    p_address TEXT, p_city TEXT, p_ward TEXT,
    p_baby_name TEXT, p_baby_birth_date DATE,
    p_notes TEXT, p_sample_type_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sample free_samples%ROWTYPE;
    v_request_id UUID;
BEGIN
    -- Lock and check sample type
    SELECT * INTO v_sample
    FROM free_samples
    WHERE id = p_sample_type_id
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Sample type not found or inactive';
    END IF;

    -- Check stock (fail closed — no compensating rollback needed)
    IF v_sample.stock <= 0 THEN
        RAISE EXCEPTION 'Out of stock for sample %', p_sample_type_id;
    END IF;

    -- Decrement stock atomically
    UPDATE free_samples
    SET stock = stock - 1,
        updated_at = NOW()
    WHERE id = p_sample_type_id
      AND stock > 0;

    -- If zero rows updated, stock was already 0 when we checked (race condition)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Out of stock for sample %', p_sample_type_id;
    END IF;

    -- Insert request
    INSERT INTO free_sample_requests (
        full_name, phone, email, address, city, ward,
        baby_name, baby_birth_date, notes, sample_type_id
    ) VALUES (
        p_full_name, p_phone, p_email, p_address, p_city, p_ward,
        p_baby_name, p_baby_birth_date, p_notes, p_sample_type_id
    )
    RETURNING id INTO v_request_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Đăng ký dùng thử thành công!',
        'request_id', v_request_id::text
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_free_sample(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, UUID
) TO anon, authenticated;
