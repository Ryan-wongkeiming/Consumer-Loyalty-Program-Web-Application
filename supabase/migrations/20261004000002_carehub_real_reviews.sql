-- ============================================================
-- CareHub: Real Reviews (Stage B)
-- 2026-10-04
-- ============================================================
-- Allow signed-in buyers to review delivered SKUs. Show those 
-- counts on product pages. Remove seeded rating/reviews from
-- public display until real reviews exist.
-- ============================================================

-- ---------- Product reviews table ----------
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    order_id UUID REFERENCES orders(id), -- ensures reviewer actually bought it
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    body TEXT,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for product reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON product_reviews
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON product_reviews
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON product_reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON product_reviews
FOR DELETE USING (auth.uid() = user_id);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON product_reviews(order_id);

-- ---------- Helper: compute average rating from real reviews ----------
DROP FUNCTION IF EXISTS public.get_product_review_stats(UUID);

CREATE OR REPLACE FUNCTION public.get_product_review_stats(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_avg NUMERIC := 0;
    v_count INTEGER := 0;
    v_star_breakdown JSONB;
BEGIN
    SELECT AVG(rating)::NUMERIC(3,1), COUNT(*)
    INTO v_avg, v_count
    FROM product_reviews
    WHERE product_id = p_product_id;

    -- Star breakdown
    SELECT jsonb_build_object(
        '5', COALESCE(SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END), 0),
        '4', COALESCE(SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END), 0),
        '3', COALESCE(SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END), 0),
        '2', COALESCE(SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END), 0),
        '1', COALESCE(SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END), 0)
    ) INTO v_star_breakdown
    FROM product_reviews WHERE product_id = p_product_id;

    RETURN jsonb_build_object(
        'average_rating', COALESCE(v_avg, 0),
        'review_count', v_count,
        'star_breakdown', v_star_breakdown
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_product_review_stats(UUID) TO anon, authenticated;

-- ---------- Check if a user has reviewed a product they purchased ----------
DROP FUNCTION IF EXISTS public.can_user_review_product(UUID, UUID);

CREATE OR REPLACE FUNCTION public.can_user_review_product(p_user_id UUID, p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_purchased BOOLEAN;
    v_has_reviewed BOOLEAN;
BEGIN
    -- Check if user bought this product in a delivered order
    SELECT EXISTS (
        SELECT 1 FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.user_id = p_user_id
          AND o.status = 'delivered'
          AND oi.product_id = p_product_id
    ) INTO v_has_purchased;

    -- Check if already reviewed
    SELECT EXISTS (
        SELECT 1 FROM product_reviews
        WHERE user_id = p_user_id AND product_id = p_product_id
    ) INTO v_has_reviewed;

    RETURN v_has_purchased AND NOT v_has_reviewed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_user_review_product(UUID, UUID) TO anon, authenticated;

-- ---------- Seed: set all seeded ratings/reviews to zero ----------
-- This prevents fake-looking numbers from being displayed
UPDATE products SET rating = 0, reviews = 0 WHERE rating > 0 OR reviews > 0;
