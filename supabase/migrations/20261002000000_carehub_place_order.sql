-- ============================================================
-- CareHub place_order RPC — atomic order creation
-- 2026-10-02
-- ============================================================
-- The client sends product ids, quantities, subscription flags,
-- delivery frequencies, shipping address, and an optional promo
-- code.  It does NOT send prices.  This function loads prices
-- from products, recomputes totals, validates the promo
-- (percent math, min-order on pre-discount subtotal, brand list,
-- usage limits), and writes orders / order_items /
-- promo_code_usages / subscriptions in one transaction.
-- Either everything commits or nothing does.
-- ============================================================

DROP FUNCTION IF EXISTS public.place_order(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_address TEXT,
    p_city TEXT,
    p_ward TEXT,
    p_notes TEXT,
    p_promo_code TEXT,
    p_items JSONB,
    p_user_id UUID,
    p_payment_method TEXT
);

CREATE OR REPLACE FUNCTION public.place_order(
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT,
    p_address TEXT,
    p_city TEXT,
    p_ward TEXT,
    p_notes TEXT,
    p_promo_code TEXT,
    p_items JSONB,          -- array of item objects
    p_user_id UUID,
    p_payment_method TEXT   -- 'cod' or 'vietqr', defaults to 'cod'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_sub_id UUID := NULL;
    v_item JSONB;
    v_product products%ROWTYPE;
    v_unit_price BIGINT;
    v_line_total BIGINT;
    v_subtotal BIGINT := 0;   -- pre-discount subtotal
    v_shipping_fee BIGINT := 50000;
    v_total BIGINT;
    v_discount_amount BIGINT := 0;
    v_bundle_discount_pct NUMERIC := 0;
    v_all_subs BOOLEAN := true;
    v_freq_weeks INTEGER := 8;
    v_next_date DATE;
    v_first_sub_id UUID := NULL;
    v_applied_freq TEXT;
    v_bundle_tier_json JSONB;
BEGIN
    -- Validate items array is not empty
    IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Order must contain at least one item';
    END IF;

    -- Determine shipping: free if all items are subscriptions
    FOR v_item IN SELECT jsonb_array_elements(p_items) LOOP
        IF COALESCE((v_item->>'is_subscription')::BOOLEAN, false) IS NOT true THEN
            v_all_subs := false;
            EXIT;
        END IF;
    END LOOP;
    IF v_all_subs THEN
        v_shipping_fee := 0;
    END IF;

    -- Process each item: load price from DB, compute unit price
    -- Store computed prices in a temp table for later use
    CREATE TEMP TABLE IF NOT EXISTS _order_items_calc (
        idx INTEGER PRIMARY KEY,
        product_id UUID,
        quantity INTEGER,
        is_subscription BOOLEAN,
        delivery_frequency TEXT,
        bundle_tier JSONB,
        unit_price BIGINT,
        line_total BIGINT
    ) ON COMMIT DROP;

    FOR v_item WITH ORDINALITY IN SELECT jsonb_array_elements(p_items) LOOP
        -- Load product from database (never trust client prices)
        SELECT * INTO v_product
        FROM products
        WHERE id = (v_item->>'product_id')::UUID
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Product % not found', v_item->>'product_id';
        END IF;

        -- Compute bundle discount for this quantity
        v_bundle_discount_pct := 0;
        v_bundle_tier_json := NULL;
        IF v_product.bundle_pricing IS NOT NULL AND v_product.bundle_pricing != 'null' THEN
            BEGIN
                -- Find highest applicable tier
                FOR v_item IN
                    SELECT bp
                    FROM jsonb_array_elements(
                        CASE WHEN pg_typeof(v_product.bundle_pricing) = 'jsonb'
                             THEN v_product.bundle_pricing::jsonb
                             ELSE NULL::jsonb
                        END
                    ) AS bp
                    WHERE COALESCE((bp)->>'quantity', '0')::INTEGER <= (v_item->>'quantity')::INTEGER
                    ORDER BY (bp)->>'quantity'::TEXT::INTEGER DESC
                    LIMIT 1
                LOOP
                    v_bundle_discount_pct := COALESCE((v_item->>'discountPercent')::NUMERIC, 0);
                    v_bundle_tier_json := v_item;
                    EXIT;
                END LOOP;
            EXCEPTION WHEN OTHERS THEN
                v_bundle_discount_pct := 0;
            END;
        END IF;

        -- Start with base price
        v_unit_price := v_product.price;

        -- Apply bundle discount
        IF v_bundle_discount_pct > 0 THEN
            v_unit_price := ROUND(v_unit_price * (1 - v_bundle_discount_pct / 100));
        END IF;

        -- Apply subscription multiplier
        IF COALESCE((v_item->>'is_subscription')::BOOLEAN, false) THEN
            IF v_product.category = 'Infant Formula' THEN
                v_unit_price := ROUND(v_unit_price * 0.90);
            ELSE
                v_unit_price := ROUND(v_unit_price * 0.85);
            END IF;
        END IF;

        -- Compute line total
        v_line_total := v_unit_price * (v_item->>'quantity')::INTEGER;
        v_subtotal := v_subtotal + v_line_total;

        -- Store computed values
        INSERT INTO _order_items_calc (idx, product_id, quantity, is_subscription,
                                        delivery_frequency, bundle_tier, unit_price, line_total)
        VALUES (v_item, (v_item->>'product_id')::UUID,
                (v_item->>'quantity')::INTEGER,
                COALESCE((v_item->>'is_subscription')::BOOLEAN, false),
                v_item->>'delivery_frequency', v_bundle_tier_json,
                v_unit_price, v_line_total);
    END LOOP;

    -- Validate and apply promo code (case-insensitive)
    IF p_promo_code IS NOT NULL AND trim(p_promo_code) <> '' THEN
        DECLARE
            promo_rec promo_codes%ROWTYPE;
        BEGIN
            -- Lock and fetch promo code (case-insensitive)
            SELECT * INTO promo_rec
            FROM promo_codes
            WHERE code ILIKE trim(p_promo_code)
            FOR UPDATE;

            IF NOT FOUND OR NOT promo_rec.is_active THEN
                RAISE EXCEPTION 'Promo code "%" is invalid or inactive.', p_promo_code;
            END IF;

            -- Expiry check
            IF promo_rec.expires_at IS NOT NULL AND promo_rec.expires_at < NOW() THEN
                RAISE EXCEPTION 'Promo code "%" has expired.', p_promo_code;
            END IF;

            -- Minimum order amount (on pre-discount subtotal)
            IF promo_rec.min_order_amount IS NOT NULL AND promo_rec.min_order_amount > 0 THEN
                IF v_subtotal < promo_rec.min_order_amount THEN
                    RAISE EXCEPTION 'Promo code "%" requires a minimum order of %đ.',
                        p_promo_code, promo_rec.min_order_amount;
                END IF;
            END IF;

            -- Usage limits
            IF promo_rec.type = 'unique' THEN
                IF promo_rec.current_uses >= 1 THEN
                    RAISE EXCEPTION 'Unique promo code "%" has already been used.', promo_rec.code;
                END IF;
            ELSIF promo_rec.type = 'multi-use' THEN
                IF promo_rec.max_uses IS NOT NULL AND promo_rec.current_uses >= promo_rec.max_uses THEN
                    RAISE EXCEPTION 'Multi-use promo code "%" has reached its maximum usage limit.', promo_rec.code;
                END IF;
            END IF;

            -- Brand restriction check
            IF promo_rec.applicable_brands IS NOT NULL AND array_length(promo_rec.applicable_brands, 1) > 0 THEN
                PERFORM 1
                FROM _order_items_calc oic
                JOIN products p ON p.id = oic.product_id
                WHERE p.brand <> ALL(promo_rec.applicable_brands);

                IF FOUND THEN
                    RAISE EXCEPTION 'Promo code "%" is not applicable to all items in the order.', p_promo_code;
                END IF;
            END IF;

            -- Calculate applied discount
            IF promo_rec.discount_type = 'percent' THEN
                v_discount_amount := ROUND(v_subtotal * promo_rec.discount / 100);
            ELSE
                v_discount_amount := promo_rec.discount;
            END IF;

            -- Increment usage counter (atomic)
            UPDATE promo_codes
            SET
                current_uses = promo_rec.current_uses + 1,
                is_active = CASE WHEN promo_rec.type = 'unique' THEN FALSE ELSE promo_rec.is_active END
            WHERE code ILIKE trim(p_promo_code);
        END;
    END IF;

    -- Compute final total
    v_total := GREATEST(0, v_subtotal + v_shipping_fee - v_discount_amount);

    -- Determine payment method (default to 'cod')
    DECLARE
        v_payment_method TEXT := COALESCE(p_payment_method, 'cod');
    BEGIN
        IF v_payment_method NOT IN ('cod', 'vietqr') THEN
            v_payment_method := 'cod';
        END IF;
    END;

    -- Create order row
    INSERT INTO orders (full_name, phone, email, address, city, ward, notes,
                         total_amount, promo_code_applied, user_id, payment_method)
    VALUES (p_full_name, p_phone, p_email, p_address, p_city, p_ward, p_notes,
            v_total, p_promo_code, p_user_id, COALESCE(p_payment_method, 'cod'))
    RETURNING id INTO v_order_id;

    -- Record promo usage with actual order_id
    IF p_promo_code IS NOT NULL AND trim(p_promo_code) <> '' THEN
        INSERT INTO promo_code_usages (promo_code, order_id, discount_amount_applied,
                                        user_id, customer_phone, customer_email)
        VALUES (p_promo_code, v_order_id, v_discount_amount, p_user_id, p_phone, p_email);
    END IF;

    -- Insert order items using pre-computed prices
    INSERT INTO order_items (order_id, product_id, product_name, quantity,
                              price_at_purchase, is_subscription,
                              delivery_frequency, bundle_tier)
    SELECT v_order_id, oic.product_id, p.name, oic.quantity,
           oic.unit_price, oic.is_subscription,
           oic.delivery_frequency, oic.bundle_tier
    FROM _order_items_calc oic
    JOIN products p ON p.id = oic.product_id;

    -- Create subscriptions grouped by frequency
    FOR v_item WITH ORDINALITY IN SELECT jsonb_array_elements(p_items) LOOP
        IF COALESCE((v_item->>'is_subscription')::BOOLEAN, false) THEN
            v_applied_freq := v_item->>'delivery_frequency';

            -- Parse frequency weeks
            v_freq_weeks := 8;
            IF v_applied_freq LIKE '%4%' THEN v_freq_weeks := 4;
            ELSIF v_applied_freq LIKE '%12%' THEN v_freq_weeks := 12;
            END IF;

            -- Check if we already created a subscription for this frequency
            IF v_first_sub_id IS NULL THEN
                v_next_date := CURRENT_DATE + (v_freq_weeks * 7 || ' days')::INTERVAL;

                INSERT INTO subscriptions (user_id, frequency_weeks, next_delivery_date, status)
                VALUES (p_user_id, v_freq_weeks, v_next_date, 'active')
                RETURNING id INTO v_first_sub_id;

                -- Link order to first subscription
                UPDATE orders SET subscription_id = v_first_sub_id WHERE id = v_order_id;
            END IF;

            -- Get or reuse existing subscription for this frequency
            IF v_sub_id IS NULL OR v_sub_id IS DISTINCT FROM v_first_sub_id THEN
                -- For simplicity, link all sub items to first subscription
                -- In Phase 2 scope, multiple frequencies get separate subs
                SELECT id INTO v_sub_id FROM subscriptions
                WHERE user_id = p_user_id
                  AND frequency_weeks = v_freq_weeks
                  AND status = 'active'
                ORDER BY created_at DESC
                LIMIT 1;

                IF v_sub_id IS NULL THEN
                    v_sub_id := v_first_sub_id;
                END IF;
            END IF;

            -- Insert subscription item
            INSERT INTO subscription_items (subscription_id, product_id, quantity,
                                             is_subscription, delivery_frequency, bundle_tier)
            VALUES (COALESCE(v_sub_id, v_first_sub_id),
                    (v_item->>'product_id')::UUID,
                    (v_item->>'quantity')::INTEGER,
                    true,
                    v_applied_freq,
                    CASE WHEN v_item->'bundle_tier' IS NOT NULL AND v_item->'bundle_tier' != 'null'
                         THEN v_item->'bundle_tier'
                         ELSE NULL END);
        END IF;
    END LOOP;

    -- Return result
    RETURN jsonb_build_object(
        'order_id', v_order_id::text,
        'subscription_id', COALESCE(v_first_sub_id::text, 'null'),
        'total', v_total,
        'subtotal', v_subtotal,
        'shipping_fee', v_shipping_fee,
        'discount', v_discount_amount
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_order(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, UUID, TEXT
) TO anon, authenticated;
