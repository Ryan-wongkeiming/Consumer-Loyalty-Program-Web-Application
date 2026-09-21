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
        -- Lock the promo code row to prevent race conditions
        SELECT * INTO promo_rec FROM promo_codes WHERE code = NEW.promo_code_applied FOR UPDATE;

        IF NOT FOUND OR NOT promo_rec.is_active THEN
            RAISE EXCEPTION 'Promo code "%" is invalid or inactive.', NEW.promo_code_applied;
        END IF;

        -- Point 2: expiry check
        IF promo_rec.expires_at IS NOT NULL AND promo_rec.expires_at < NOW() THEN
            RAISE EXCEPTION 'Promo code "%" has expired.', NEW.promo_code_applied;
        END IF;

        -- Point 2: minimum order amount check
        IF NEW.total_amount IS NOT NULL AND NEW.total_amount < promo_rec.min_order_amount THEN
            RAISE EXCEPTION 'Promo code "%" requires a minimum order of %đ.', NEW.promo_code_applied, promo_rec.min_order_amount;
        END IF;

        -- Usage limits
        IF promo_rec.type = 'unique' THEN
            IF promo_rec.current_uses >= 1 THEN
                RAISE EXCEPTION 'Unique promo code "%" has already been used.', NEW.promo_code_applied;
            END IF;
        ELSIF promo_rec.type = 'multi-use' THEN
            IF promo_rec.max_uses IS NOT NULL AND promo_rec.current_uses >= promo_rec.max_uses THEN
                RAISE EXCEPTION 'Multi-use promo code "%" has reached its maximum usage limit.', NEW.promo_code_applied;
            END IF;
        END IF;

        -- Update usage counters
        UPDATE promo_codes
        SET
            current_uses = promo_rec.current_uses + 1,
            is_active = CASE WHEN promo_rec.type = 'unique' THEN FALSE ELSE promo_rec.is_active END
        WHERE code = NEW.promo_code_applied;

        -- Log usage (Point 4: include customer contact info)
        INSERT INTO promo_code_usages (promo_code, order_id, discount_amount_applied, user_id, customer_phone, customer_email)
        VALUES (NEW.promo_code_applied, NEW.id, promo_rec.discount, NEW.user_id, NEW.phone, NEW.email);
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