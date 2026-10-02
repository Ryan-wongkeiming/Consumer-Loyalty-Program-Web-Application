-- ============================================================
-- CareHub promo system enhancement (Points 2, 3, 4)
-- 2026-09-21
-- ============================================================
-- Point 2: percentage discounts + expiry dates + min order + brand restriction
-- Point 3: one-time ('unique') checkout codes coexist with loyalty_codes table
-- Point 4: richer promo usage tracking (customer contact info)
-- ============================================================

-- ---------- Point 2: extend promo_codes ----------
ALTER TABLE public.promo_codes
  ADD COLUMN discount_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (discount_type IN ('fixed', 'percent')),
  ADD COLUMN expires_at TIMESTAMPTZ,            -- NULL = never expires
  ADD COLUMN min_order_amount BIGINT DEFAULT 0,  -- minimum subtotal (VND) to use
  ADD COLUMN applicable_brands TEXT[];           -- NULL/empty = all brands

-- Backfill: existing codes are all fixed VND (discount column already holds VND)
-- (no data change needed; discount_type defaults to 'fixed')

-- ---------- Point 4: enrich promo_code_usages ----------
ALTER TABLE public.promo_code_usages
  ADD COLUMN customer_phone TEXT,
  ADD COLUMN customer_email TEXT;

-- ---------- Point 3 + Point 2: upgrade the usage trigger ----------
-- The trigger now validates:
--   - is_active
--   - expiry (expires_at)
--   - usage limits (unique vs multi-use, max_uses)
--   - minimum order amount
-- and records customer contact info from the order.
DROP TRIGGER IF EXISTS after_order_insert_promo_code ON public.orders;
DROP FUNCTION IF EXISTS public.handle_promo_code_usage();

CREATE OR REPLACE FUNCTION public.handle_promo_code_usage()
RETURNS TRIGGER AS $$
DECLARE
    promo_rec promo_codes%ROWTYPE;
BEGIN
    IF NEW.promo_code_applied IS NOT NULL THEN
        -- Lock the promo code row to prevent race conditions (case-insensitive)
        SELECT * INTO promo_rec FROM promo_codes WHERE code ILIKE NEW.promo_code_applied FOR UPDATE;

        IF NOT FOUND OR NOT promo_rec.is_active THEN
            RAISE EXCEPTION 'Promo code "%" is invalid or inactive.', NEW.promo_code_applied;
        END IF;

        -- Point 2: expiry check
        IF promo_rec.expires_at IS NOT NULL AND promo_rec.expires_at < NOW() THEN
            RAISE EXCEPTION 'Promo code "%" has expired.', NEW.promo_code_applied;
        END IF;

        -- Point 2: minimum order amount check (against pre-discount subtotal)
        -- Calculate pre-discount subtotal from order items
        DECLARE
            pre_discount_subtotal BIGINT := 0;
            item_record RECORD;
        BEGIN
            SELECT SUM(oi.quantity * p.price) INTO pre_discount_subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = NEW.id;
            
            IF pre_discount_subtotal IS NULL THEN
                pre_discount_subtotal := 0;
            END IF;
            
            IF NEW.total_amount IS NOT NULL AND pre_discount_subtotal < promo_rec.min_order_amount THEN
                RAISE EXCEPTION 'Promo code "%" requires a minimum order of %đ.', NEW.promo_code_applied, promo_rec.min_order_amount;
            END IF;
        END;

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

        -- Update usage counters (case-insensitive)
        UPDATE promo_codes
        SET
            current_uses = promo_rec.current_uses + 1,
            is_active = CASE WHEN promo_rec.type = 'unique' THEN FALSE ELSE promo_rec.is_active END
        WHERE code ILIKE NEW.promo_code_applied;

        -- Log usage (Point 4: include customer contact info)
        -- Calculate the actual applied discount amount
        DECLARE
            applied_discount BIGINT;
            item_record RECORD;
            subtotal_before_discount BIGINT := 0;
        BEGIN
            -- Calculate pre-discount subtotal
            SELECT SUM(oi.quantity * p.price) INTO subtotal_before_discount
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = NEW.id;
            
            IF subtotal_before_discount IS NULL THEN
                subtotal_before_discount := 0;
            END IF;
            
            -- Calculate applied discount based on type
            IF promo_rec.discount_type = 'percent' THEN
                applied_discount := ROUND(subtotal_before_discount * promo_rec.discount / 100);
            ELSE
                applied_discount := promo_rec.discount;
            END IF;
            
            -- Check applicable brands if specified
            IF promo_rec.applicable_brands IS NOT NULL AND array_length(promo_rec.applicable_brands, 1) > 0 THEN
                -- Check if all items in the order are from applicable brands
                PERFORM 1
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = NEW.id
                  AND p.brand <> ALL(promo_rec.applicable_brands);
                  
                IF FOUND THEN
                    RAISE EXCEPTION 'Promo code "%" is not applicable to all items in the order.', NEW.promo_code_applied;
                END IF;
            END IF;
            
            INSERT INTO promo_code_usages (promo_code, order_id, discount_amount_applied, user_id, customer_phone, customer_email)
            VALUES (NEW.promo_code_applied, NEW.id, applied_discount, NEW.user_id, NEW.phone, NEW.email);
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.handle_promo_code_usage() TO anon, authenticated;

CREATE TRIGGER after_order_insert_promo_code
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.promo_code_applied IS NOT NULL)
EXECUTE FUNCTION public.handle_promo_code_usage();

-- ---------- RLS: allow anon/authenticated to read non-expired active codes ----------
-- (the frontend needs to validate against the full record; expose active + not expired)
DROP POLICY IF EXISTS "Enable read access for active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Enable read access for active promo codes_duplicate" ON public.promo_codes;
CREATE POLICY "Enable read access for active promo codes" ON public.promo_codes
FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- ---------- Seed: keep the existing 7 codes working (fixed type) ----------
UPDATE public.promo_codes SET discount_type = 'fixed' WHERE discount_type IS NULL;