-- ============================================================
-- CareHub: Earn points on delivered orders (Stage A)
-- 2026-10-03
-- ============================================================
-- Points are credited server-side in SQL when an order status
-- changes to 'delivered'. No browser involvement.
--
-- Rate: 1 point per 10,000 VND of delivered subtotal.
-- Bonus: +50% extra points for subscription orders.
--
-- Usage: Call mark_order_delivered(order_id) from staff surface
-- or trigger it automatically when a COD confirmation arrives.
-- ============================================================

-- ---------- Helper: calculate points for one order ----------
DROP FUNCTION IF EXISTS public.calculate_delivery_points(
    p_total_amount BIGINT,
    p_is_subscription BOOLEAN
);

CREATE OR REPLACE FUNCTION public.calculate_delivery_points(
    p_total_amount BIGINT,
    p_is_subscription BOOLEAN
) RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
    v_base_points BIGINT;
BEGIN
    -- 1 point per 10,000 VND
    v_base_points := FLOOR(p_total_amount / 10000);

    -- Subscription bonus: +50%
    IF p_is_subscription THEN
        v_base_points := v_base_points + FLOOR(v_base_points * 0.5);
    END IF;

    RETURN v_base_points;
END;
$$;

-- ---------- Main function: mark order delivered + credit points ----------
DROP FUNCTION IF EXISTS public.mark_order_delivered(UUID);

CREATE OR REPLACE FUNCTION public.mark_order_delivered(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_sub_id UUID;
    v_has_subscription BOOLEAN := false;
    v_points_earned BIGINT;
BEGIN
    -- Lock and load order
    SELECT * INTO v_order
    FROM orders
    WHERE id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found';
    END IF;

    -- Already delivered? Skip silently
    IF v_order.status = 'delivered' THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Order already marked as delivered.',
            'points_earned', 0
        );
    END IF;

    -- Check if this order has a linked subscription
    IF v_order.subscription_id IS NOT NULL THEN
        v_has_subscription := true;
    ELSE
        -- Also check if any order item is a subscription
        PERFORM 1 FROM order_items WHERE order_id = p_order_id AND is_subscription = true LIMIT 1;
        IF FOUND THEN
            v_has_subscription := true;
        END IF;
    END IF;

    -- Calculate points
    v_points_earned := calculate_delivery_points(v_order.total_amount, v_has_subscription);

    -- Update order status to delivered
    UPDATE orders
    SET status = 'delivered',
        delivered_at = NOW()
    WHERE id = p_order_id;

    -- Credit points to user (only if user exists)
    IF v_order.user_id IS NOT NULL AND v_points_earned > 0 THEN
        -- Upsert points: add earned points to existing balance
        INSERT INTO user_loyalty_points (user_id, total_points, last_updated_at)
        VALUES (v_order.user_id, v_points_earned, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            total_points = user_loyalty_points.total_points + v_points_earned,
            last_updated_at = NOW();
    END IF;

    -- Log the point earn event
    INSERT INTO loyalty_point_events (user_id, order_id, points_earned, event_type, description)
    VALUES (
        v_order.user_id,
        p_order_id,
        v_points_earned,
        'order_delivered',
        'Earned ' || v_points_earned || ' points on delivered order #' || p_order_id::text
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Order marked as delivered.',
        'points_earned', v_points_earned,
        'has_subscription', v_has_subscription
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_order_delivered(UUID) TO anon, authenticated;

-- ---------- Create loyalty_point_events table if missing ----------
CREATE TABLE IF NOT EXISTS loyalty_point_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id),
    points_earned BIGINT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for loyalty point events
ALTER TABLE loyalty_point_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read loyalty events" ON loyalty_point_events
FOR SELECT USING (true);

CREATE POLICY "Allow service insert loyalty events" ON loyalty_point_events
FOR INSERT WITH CHECK (true);
