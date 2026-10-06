-- ============================================================
-- Phase A6: Staff RPC functions for order management
-- 2026-10-06
-- ============================================================

DROP FUNCTION IF EXISTS public.update_order_status(p_order_id UUID, p_new_status TEXT, p_notes TEXT);
CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_status TEXT;
    v_user_id UUID := auth.uid();
    v_rec orders%ROWTYPE;
BEGIN
    -- Validate status
    IF p_new_status NOT IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be one of: pending, confirmed, processing, shipped, delivered', p_new_status;
    END IF;

    -- Fetch current order
    SELECT * INTO v_rec FROM orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    v_old_status := COALESCE(v_rec.status, 'pending');

    -- Prevent invalid transitions
    IF v_old_status = 'delivered' AND p_new_status != 'delivered' THEN
        RAISE EXCEPTION 'Cannot change status of a delivered order';
    END IF;

    -- Update order
    UPDATE orders SET
        status = p_new_status,
        updated_by = v_user_id,
        shipped_at = CASE WHEN p_new_status = 'shipped' AND v_rec.shipped_at IS NULL THEN NOW() ELSE shipped_at END,
        delivered_at = CASE WHEN p_new_status = 'delivered' AND v_rec.delivered_at IS NULL THEN NOW() ELSE delivered_at END
    WHERE id = p_order_id;

    -- Record history
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (p_order_id, v_old_status, p_new_status, v_user_id, p_notes);

    -- Return updated order
    SELECT row_to_json(o)::jsonb INTO v_rec FROM (SELECT * FROM orders WHERE id = p_order_id) o;
    RETURN v_rec;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT, TEXT) TO authenticated;


-- ============================================================
-- Add tracking number to order
-- ============================================================

DROP FUNCTION IF EXISTS public.add_tracking_number(p_order_id UUID, p_tracking_number TEXT, p_carrier TEXT);
CREATE OR REPLACE FUNCTION public.add_tracking_number(
    p_order_id UUID,
    p_tracking_number TEXT,
    p_carrier TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_rec orders%ROWTYPE;
    v_user_id UUID := auth.uid();
BEGIN
    SELECT * INTO v_rec FROM orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;

    UPDATE orders SET
        tracking_number = p_tracking_number,
        carrier_name = p_carrier,
        status = GREATEST(status, 'shipped'),
        updated_by = v_user_id,
        shipped_at = COALESCE(shipped_at, NOW())
    WHERE id = p_order_id;

    -- Record history
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes)
    VALUES (p_order_id, COALESCE(v_rec.status, 'pending'), 'shipped', v_user_id, 
            'Tracking number added: ' || p_tracking_number);

    -- Return updated order
    SELECT row_to_json(o)::jsonb INTO v_rec FROM (SELECT * FROM orders WHERE id = p_order_id) o;
    RETURN v_rec;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_tracking_number(UUID, TEXT, TEXT) TO authenticated;


-- ============================================================
-- Get orders with filters (for Fulfillment Page)
-- ============================================================

DROP FUNCTION IF EXISTS public.get_orders(p_status TEXT, p_page INTEGER, p_limit INTEGER);
CREATE OR REPLACE FUNCTION public.get_orders(
    p_status TEXT DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 50
) RETURNS TABLE (
    id UUID,
    full_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    ward TEXT,
    total_amount BIGINT,
    payment_method TEXT,
    status TEXT,
    tracking_number TEXT,
    created_at TIMESTAMPTZ,
    subscription_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_offset INTEGER;
BEGIN
    v_offset := (p_page - 1) * p_limit;
    
    RETURN QUERY
    SELECT o.id, o.full_name, o.phone, o.email, o.address, o.city, o.ward,
           o.total_amount, o.payment_method, o.status, o.tracking_number,
           o.created_at, o.subscription_id
    FROM orders o
    WHERE p_status IS NULL OR o.status = p_status
    ORDER BY o.created_at DESC
    LIMIT LEAST(p_limit, 200)
    OFFSET v_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_orders(TEXT, INTEGER, INTEGER) TO authenticated;


-- ============================================================
-- Get single order with full details (items + subscriptions)
-- ============================================================

DROP FUNCTION IF EXISTS public.get_order_details(p_order_id UUID);
CREATE OR REPLACE FUNCTION public.get_order_details(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'order', row_to_json(o)::jsonb,
        'items', (
            SELECT jsonb_agg(jsonb_build_object(
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'price_at_purchase', oi.price_at_purchase,
                'is_subscription', oi.is_subscription,
                'delivery_frequency', oi.delivery_frequency,
                'bundle_tier', oi.bundle_tier
            ))
            FROM order_items oi WHERE oi.order_id = p_order_id
        ),
        'status_history', (
            SELECT jsonb_agg(jsonb_build_object(
                'old_status', h.old_status,
                'new_status', h.new_status,
                'changed_by', h.changed_by,
                'notes', h.notes,
                'created_at', h.created_at
            ))
            FROM order_status_history h
            WHERE h.order_id = p_order_id
            ORDER BY h.created_at ASC
        )
    ) INTO result
    FROM orders o
    WHERE o.id = p_order_id;
    
    IF result IS NULL THEN
        RAISE EXCEPTION 'Order % not found', p_order_id;
    END IF;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_details(UUID) TO authenticated;
