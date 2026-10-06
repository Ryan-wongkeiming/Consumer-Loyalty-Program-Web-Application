-- ============================================================
-- VietQR payment URL generation (MoMo via MoMo API)
-- 2026-10-06
-- ============================================================

DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(
    p_order_id UUID,
    p_amount BIGINT
);

CREATE OR REPLACE FUNCTION public.generate_vietqr_payment_url(
    p_order_id UUID,
    p_amount BIGINT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_bank_code TEXT := 'VBBANK'; -- Vietcombank
    v_acct_no TEXT := '0123456789'; -- Replace with your actual VietQR account number
    v_acct_name TEXT := 'CÔNG TY CAREHUB'; -- Replace with your company name
    v_txn_ref TEXT;
    v_amount BIGINT;
    v_description TEXT;
BEGIN
    -- Fetch order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    -- Amount in VND (convert from cents if needed)
    v_amount := CASE WHEN p_amount > 1000000 THEN p_amount / 100 ELSE p_amount END;
    
    -- Transaction reference
    v_txn_ref := 'CH' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD(p_order_id::text::varchar(8), 8, '0');
    
    -- Description
    v_description := 'Thanh don hang #' || p_order_id::text || ' CareHub';
    
    -- Return a temporary "hold" response
    -- In production, integrate with MoMo/ZaloPay/Napas APIs here
    RETURN jsonb_build_object(
        'order_id', p_order_id::text,
        'amount', v_amount,
        'bank_code', v_bank_code,
        'account_number', v_acct_no,
        'account_name', v_acct_name,
        'description', v_description,
        'transaction_reference', v_txn_ref,
        'qr_code_url', NULL,
        'payment_url', NULL,
        'note', 'Chức năng VietQR đang được tích hợp. Vui lòng chuyển khoản đến tài khoản trên.'
    )::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_vietqr_payment_url(UUID, BIGINT) TO anon, authenticated;
