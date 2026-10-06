-- ============================================================
-- Fix VietQR RPC: accept TEXT for order_id (RPC returns string)
-- 2026-10-06
-- ============================================================

-- Drop ALL conflicting versions first
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(p_order_id UUID, p_amount BIGINT);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(p_order_id UUID, p_amount INTEGER);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(UUID, BIGINT);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(UUID, INTEGER);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(p_order_id TEXT, p_amount BIGINT);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(p_order_id TEXT, p_amount INTEGER);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(TEXT, BIGINT);
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(TEXT, INTEGER);

-- Recreate with TEXT for order_id — matches what place_order RPC returns
CREATE OR REPLACE FUNCTION public.generate_vietqr_payment_url(
    p_order_id TEXT,
    p_amount BIGINT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bank_code TEXT := 'VBBANK';
    v_acct_no TEXT := '0123456789';
    v_acct_name TEXT := 'CÔNG TY CAREHUB';
    v_amount BIGINT;
BEGIN
    -- Amount in VND
    v_amount := CASE WHEN p_amount > 1000000 THEN p_amount / 100 ELSE p_amount END;
    
    RETURN jsonb_build_object(
        'order_id', p_order_id,
        'amount', v_amount,
        'bank_code', v_bank_code,
        'account_number', v_acct_no,
        'account_name', v_acct_name,
        'description', 'Thanh don hang #' || p_order_id || ' CareHub',
        'note', 'Chuc nang VietQR dang duoc tich hop. Vui long chuyen khoan den tai khoan tren.'
    )::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_vietqr_payment_url(TEXT, BIGINT) TO anon, authenticated;
