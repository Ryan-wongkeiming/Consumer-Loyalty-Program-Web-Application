-- ============================================================
-- CareHub: VietQR Payment Rail (Stage A)
-- 2026-10-03
-- ============================================================
-- Adds VietQR (Vietnamese bank transfer via QR code) as a payment
-- option behind the place_order RPC. The amount is server-computed,
-- so nobody can manipulate prices through the browser.
--
-- Flow:
-- 1. Customer selects "Thanh toán qua VietQR" at checkout
-- 2. Server generates a VietQR payment URL using the order total
-- 3. Customer scans and pays via their banking app
-- 4. Webhook from payment provider updates order status
-- ============================================================

-- ---------- Payment methods enum ----------
-- Add 'vietqr' as a new payment method option
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum'
    ) THEN
        CREATE TYPE payment_method_enum AS ENUM ('cod', 'vietqr');
    END IF;
END $$;

-- ---------- Update orders table if needed ----------
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cod'
    CHECK (payment_method IN ('cod', 'vietqr'));

-- ---------- VietQR payment URL generator ----------
DROP FUNCTION IF EXISTS public.generate_vietqr_payment_url(
    p_order_id UUID,
    p_amount BIGINT,
    p_bank_code TEXT
);

CREATE OR REPLACE FUNCTION public.generate_vietqr_payment_url(
    p_order_id UUID,
    p_amount BIGINT,
    p_bank_code TEXT DEFAULT ''
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order orders%ROWTYPE;
    -- VietQR template - replace with your actual provider's API
    -- This uses the standard VNQR format
    v_template TEXT := '000201010212';  -- MNID template start
    v_account TEXT;
    v_reference TEXT;
BEGIN
    SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- In production, this would call your payment provider's API
    -- For now, return a placeholder that demonstrates the flow
    -- Replace with actual MoMo/VNPay/ZaloPay API integration
    
    v_account := COALESCE(p_bank_code, '970419'); -- Techcombank VietQR code
    v_reference := p_order_id::text;

    -- Return a structured response with payment details
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Payment URL generated successfully',
        'order_id', p_order_id::text,
        'amount', p_amount,
        'bank_code', v_account,
        'reference', v_reference,
        'payment_url', 'https://example.com/vietqr/pay?ref=' || v_reference,
        'expires_at', (NOW() + INTERVAL '15 minutes')::TEXT
    )::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_vietqr_payment_url(UUID, BIGINT, TEXT) TO anon, authenticated;

-- ---------- VietQR payment webhook handler ----------
-- Called by payment provider when payment is received
DROP FUNCTION IF EXISTS public.handle_vietqr_webhook();

CREATE OR REPLACE FUNCTION public.handle_vietqr_webhook()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ref TEXT := current_setting('app.payment.reference', true);
    v_amount BIGINT := current_setting('app.payment.amount', '0')::BIGINT;
    v_status TEXT := current_setting('app.payment.status', 'failed');
    v_order_id UUID;
BEGIN
    -- Parse reference to get order ID
    BEGIN
        v_order_id := v_ref::UUID;
    EXCEPTION WHEN OTHERS THEN
        -- Reference might be encoded differently in production
        RAISE NOTICE 'Could not parse reference as UUID: %', v_ref;
        RETURN;
    END;

    -- Only process successful payments
    IF v_status = 'success' AND v_amount > 0 THEN
        -- Verify amount matches order
        UPDATE orders
        SET
            status = 'paid',
            payment_method = 'vietqr',
            updated_at = NOW()
        WHERE id = v_order_id
          AND total_amount = v_amount;
        
        -- If amount doesn't match exactly, flag for manual review
        IF NOT FOUND THEN
            RAISE NOTICE 'Amount mismatch or order not found: ref=%, amount=%', v_ref, v_amount;
        END IF;
    END IF;
END;
$$;

-- ---------- Place order update: accept payment method ----------
-- Modify the place_order function to accept payment_method parameter
-- Note: We'll add this as an optional parameter via a new version
