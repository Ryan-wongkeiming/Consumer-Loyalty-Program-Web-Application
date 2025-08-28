/*
# Complete Blackmores E-commerce Database Schema

This migration creates the complete database schema for the Blackmores e-commerce application including:

## 1. New Tables
- `products` - Product catalog with filtering capabilities
- `promo_codes` - Promotional discount codes with usage tracking
- `orders` - Customer orders with shipping information
- `order_items` - Individual items within orders
- `promo_code_usages` - Audit trail for promo code redemptions

## 2. Security
- Enable RLS on all tables
- Comprehensive policies for SELECT, INSERT, UPDATE, DELETE operations
- Anonymous user support for checkout process
- Service role access for administrative operations

## 3. Business Logic
- Promo code validation and usage tracking via triggers
- Support for both unique and multi-use promo codes
- Order history tracking with denormalized product data
- Subscription product support

## 4. Data Population
- Complete product catalog from existing frontend data
- Initial promo codes for marketing campaigns
*/

-- Drop existing tables, functions, and triggers to ensure a clean slate
-- This is crucial to prevent "already exists" errors on subsequent runs
-- and to ensure the schema is exactly as defined.
DROP TRIGGER IF EXISTS after_order_insert_promo_code ON public.orders;
DROP FUNCTION IF EXISTS public.handle_promo_code_usage();
DROP TABLE IF EXISTS public.promo_code_usages CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.promo_codes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;


-- 1. Create the products table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    original_price BIGINT,
    image TEXT,
    category TEXT,
    benefits TEXT[],
    ingredients TEXT[], -- This is for product composition, not the new filter
    dosage TEXT,
    rating NUMERIC(2,1),
    reviews INTEGER,
    in_stock BOOLEAN DEFAULT TRUE,
    is_subscription BOOLEAN DEFAULT FALSE,
    warnings TEXT[], -- Specific to womensHealthProducts
    skus JSONB, -- Specific to womensHealthProducts
    -- New filter columns
    gender_age_categories TEXT[],
    product_ingredients TEXT[],
    health_goals TEXT[]
);

-- 2. Create the promo_codes table
CREATE TABLE public.promo_codes (
    code TEXT PRIMARY KEY,
    discount BIGINT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    type TEXT NOT NULL CHECK (type IN ('unique', 'multi-use')), -- 'unique' or 'multi-use'
    max_uses INTEGER, -- NULL for unlimited uses for multi-use codes
    current_uses INTEGER DEFAULT 0
);

-- 3. Create the orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Optional: Link to auth.users.id if user authentication is implemented
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    ward TEXT NOT NULL,
    notes TEXT,
    total_amount BIGINT NOT NULL,
    promo_code_applied TEXT REFERENCES public.promo_codes(code), -- Link to promo_codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' -- e.g., 'pending', 'completed', 'shipped', 'cancelled'
);

-- 4. Create the order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id),
    product_name TEXT NOT NULL, -- Denormalized for historical record
    quantity INTEGER NOT NULL,
    price_at_purchase BIGINT NOT NULL,
    is_subscription BOOLEAN DEFAULT FALSE,
    delivery_frequency TEXT -- e.g., 'Delivered every 8 weeks (20% off)'
);

-- 5. Create the promo_code_usages table
CREATE TABLE public.promo_code_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code TEXT NOT NULL REFERENCES public.promo_codes(code),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    discount_amount_applied BIGINT NOT NULL,
    user_id UUID, -- Optional: Link to auth.users.id
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 6. Insert initial data into products table
INSERT INTO public.products (id, name, description, price, original_price, image, category, benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription, warnings, skus, gender_age_categories, product_ingredients, health_goals) VALUES
('blackmores-subscribe', 'Blackmores Subscribe & Save', 'Get your favourite Blackmores products delivered regularly with exclusive subscriber benefits and savings.', 1149750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Subscription Service', ARRAY['Save up to 30% on every order', 'Free shipping on all deliveries', 'Flexible delivery schedule', 'Priority customer support', 'Exclusive subscriber-only products'], ARRAY['Varies by selected products'], 'As per individual product instructions', 4.8, 1247, TRUE, TRUE, NULL, NULL, ARRAY['All'], ARRAY[]::TEXT[], ARRAY['General Health']),
('Blackmores Newborn Formula', 'Blackmores Newborn Formula', 'Blackmores® Newborn Formula has been developed with a special blend of nutrients to help meet the nutritional needs of your baby from birth to 6 months.', 639000, NULL, 'https://www.blackmores.com.vn/-/media/4e275bc6175a48faa126ce812cb371f8.png?h=1000&iar=0&w=1000&hash=0623BD25DE25CF502AB432BE9500E2ED', 'Infant Formula', ARRAY['Supports bone health', 'Maintains immune system function', 'Supports muscle strength', 'Aids calcium absorption'], ARRAY['Cholecalciferol (Vitamin D3) 25 micrograms (1000 IU)'], 'Adults: Take 1 capsule daily with food', 4.6, 892, TRUE, FALSE, NULL, NULL, ARRAY['Infant Formula'], ARRAY['Vitamin D'], ARRAY['General Health', 'Joints, Bones & Muscles']),
('Blackmores Follow-on Formula', 'Blackmores Follow-on Formula', 'Blackmores Follow-on Formula has been developed with a special blend of nutrients to help meet the nutritional needs of your baby from 6 to 12 months.', 639000, NULL, 'https://www.blackmores.com.vn/-/media/862e5de903484adc97c317b68ce6a45e.png', 'Infant Formula', ARRAY['Supports heart health', 'Maintains brain function', 'Supports eye health', 'Anti-inflammatory properties'], ARRAY['Fish Oil 1500mg', 'Providing Omega-3 marine triglycerides 450mg', 'EPA 270mg, DHA 180mg'], 'Adults: Take 1 capsule daily with food', 4.7, 1156, TRUE, FALSE, NULL, NULL, ARRAY['Infant Formula'], ARRAY['Fish Oil & Omega 3'], ARRAY['Brain Health', 'Heart Health', 'Eye Health']),
('Blackmores Toddler Milk Drink', 'Blackmores Toddler Milk Drink', 'Blackmores® Toddler Milk Drink contains the essential vitamins and minerals to support your growing toddler`s nutritional needs.', 619000, NULL, 'https://www.blackmores.com.vn/-/media/e99de2f89c514e0b9fe2e6410055dc3e.png', 'Infant Formula', ARRAY['Supports energy production', 'Maintains general wellbeing', 'Supports immune function', 'Assists with stress management'], ARRAY['Vitamin B1, B2, B3, B5, B6, B12', 'Vitamin C, Vitamin D3', 'Iron, Magnesium, Zinc'], 'Adults: Take 1 tablet daily with breakfast', 4.5, 743, TRUE, FALSE, NULL, NULL, ARRAY['Kids'], ARRAY['Vitamin C', 'Vitamin D', 'Iron', 'Magnesium', 'Zinc'], ARRAY['Energy', 'Cold, Flu & Immunity', 'General Health']),
('calcium-magnesium-d3', 'Calcium Magnesium + D3', 'Complete bone health formula combining calcium, magnesium and vitamin D3 for optimal absorption.', 899750, 1074750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Minerals', ARRAY['Supports bone density', 'Maintains muscle function', 'Supports nerve transmission', 'Aids calcium absorption'], ARRAY['Calcium carbonate 500mg', 'Magnesium oxide 200mg', 'Vitamin D3 400IU'], 'Adults: Take 2 tablets daily with meals', 4.4, 567, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY['Magnesium', 'Vitamin D'], ARRAY['Joints, Bones & Muscles', 'General Health']),
('probiotics-daily', 'Daily Probiotics 30 Billion', 'High-potency probiotic formula with 30 billion live cultures to support digestive and immune health.', 1149750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Probiotics', ARRAY['Supports digestive health', 'Maintains gut flora balance', 'Supports immune function', 'Aids nutrient absorption'], ARRAY['Lactobacillus acidophilus 10 billion CFU', 'Bifidobacterium lactis 10 billion CFU', 'Lactobacillus plantarum 10 billion CFU'], 'Adults: Take 1 capsule daily with food', 4.6, 892, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY['Probiotics'], ARRAY['Digestive Health', 'Cold, Flu & Immunity']),
('iron-plus', 'Iron Plus with Vitamin C', 'Gentle iron supplement enhanced with vitamin C for better absorption and reduced stomach upset.', 624750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Minerals', ARRAY['Supports healthy iron levels', 'Reduces tiredness and fatigue', 'Supports oxygen transport', 'Maintains energy levels'], ARRAY['Iron bisglycinate 24mg', 'Vitamin C 60mg', 'Folic acid 400mcg'], 'Adults: Take 1 tablet daily with food', 4.3, 445, TRUE, FALSE, NULL, NULL, ARRAY['Women''s'], ARRAY['Iron', 'Vitamin C'], ARRAY['Energy', 'General Health']),
('zinc-immune', 'Zinc Immune Support', 'High-strength zinc supplement to support immune function and wound healing.', 499750, 624750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Minerals', ARRAY['Supports immune function', 'Aids wound healing', 'Supports skin health', 'Maintains taste and smell'], ARRAY['Zinc gluconate 25mg', 'Providing elemental zinc 3.5mg'], 'Adults: Take 1 tablet daily with food', 4.2, 334, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY['Zinc'], ARRAY['Cold, Flu & Immunity', 'Nails, Hair & Skin']),
('coq10-heart', 'CoQ10 Heart Health', 'Premium CoQ10 supplement to support cardiovascular health and cellular energy production.', 1324750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Vitamins', ARRAY['Supports heart health', 'Maintains cellular energy', 'Antioxidant protection', 'Supports muscle function'], ARRAY['Coenzyme Q10 150mg'], 'Adults: Take 1 capsule daily with food', 4.7, 678, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Heart Health', 'Energy']),
('turmeric-curcumin', 'Turmeric Curcumin Complex', 'High-potency turmeric extract with black pepper for enhanced absorption and anti-inflammatory support.', 974750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Natural anti-inflammatory', 'Supports joint health', 'Antioxidant protection', 'Supports digestive health'], ARRAY['Turmeric root extract 500mg', 'Curcumin 95% 475mg', 'Black pepper extract 5mg'], 'Adults: Take 2 capsules daily with meals', 4.5, 789, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Joints, Bones & Muscles', 'Digestive Health']),
('magnesium-sleep', 'Magnesium Sleep Support', 'Chelated magnesium formula designed to promote relaxation and support quality sleep.', 724750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Minerals', ARRAY['Promotes relaxation', 'Supports quality sleep', 'Maintains muscle function', 'Supports nervous system'], ARRAY['Magnesium glycinate 400mg', 'Providing elemental magnesium 80mg'], 'Adults: Take 2 tablets 30 minutes before bed', 4.4, 523, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY['Magnesium'], ARRAY['Sleep & Stress', 'Joints, Bones & Muscles']),
('vitamin-b-complex', 'B-Complex Energy Formula', 'Complete B-vitamin complex to support energy metabolism and nervous system function.', 674750, 799750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Vitamins', ARRAY['Supports energy production', 'Maintains nervous system', 'Supports mental clarity', 'Aids stress management'], ARRAY['Thiamine (B1) 25mg', 'Riboflavin (B2) 25mg', 'Niacin (B3) 50mg', 'Pyridoxine (B6) 25mg', 'Cobalamin (B12) 100mcg'], 'Adults: Take 1 tablet daily with breakfast', 4.3, 612, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Energy', 'Sleep & Stress']),
('glucosamine-chondroitin', 'Glucosamine Chondroitin MSM', 'Triple-action joint support formula with glucosamine, chondroitin and MSM for optimal joint health.', 1074750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports joint health', 'Maintains cartilage', 'Supports mobility', 'Reduces joint stiffness'], ARRAY['Glucosamine sulfate 1500mg', 'Chondroitin sulfate 1200mg', 'MSM 1000mg'], 'Adults: Take 3 tablets daily with meals', 4.6, 834, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Joints, Bones & Muscles']),
('evening-primrose-oil', 'Evening Primrose Oil 1000mg', 'Cold-pressed evening primrose oil rich in GLA to support women''s health and skin condition.', 849750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports women''s health', 'Maintains skin condition', 'Supports hormonal balance', 'Rich in essential fatty acids'], ARRAY['Evening Primrose Oil 1000mg', 'Providing GLA 100mg'], 'Adults: Take 2 capsules daily with meals', 4.4, 456, TRUE, FALSE, NULL, NULL, ARRAY['Women''s'], ARRAY[]::TEXT[], ARRAY['Nails, Hair & Skin', 'Preconception, Pregnancy & Breastfeeding']),
('milk-thistle-liver', 'Milk Thistle Liver Support', 'Standardized milk thistle extract to support liver health and natural detoxification processes.', 799750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports liver health', 'Aids natural detoxification', 'Antioxidant protection', 'Supports liver regeneration'], ARRAY['Milk Thistle extract 150mg', 'Standardized to 80% silymarin'], 'Adults: Take 1 capsule twice daily with meals', 4.5, 387, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['General Health']),
('cranberry-uti', 'Cranberry Urinary Health', 'Concentrated cranberry extract to support urinary tract health and maintain bladder function.', 699750, 824750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports urinary tract health', 'Maintains bladder function', 'Natural antioxidants', 'Supports immune function'], ARRAY['Cranberry extract 25000mg', 'Equivalent to fresh cranberries'], 'Adults: Take 1 capsule daily with water', 4.3, 298, TRUE, FALSE, NULL, NULL, ARRAY['Women''s'], ARRAY[]::TEXT[], ARRAY['General Health']),
('ginkgo-memory', 'Ginkgo Biloba Memory Support', 'Standardized ginkgo biloba extract to support cognitive function and mental clarity.', 749750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports cognitive function', 'Maintains mental clarity', 'Supports circulation', 'Antioxidant protection'], ARRAY['Ginkgo Biloba extract 120mg', 'Standardized to 24% flavonoids'], 'Adults: Take 1 tablet daily with food', 4.2, 445, FALSE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Brain Health']),
('garlic-cardiovascular', 'Odourless Garlic Heart Health', 'Odourless garlic extract to support cardiovascular health and maintain healthy cholesterol levels.', 574750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports heart health', 'Maintains cholesterol levels', 'Supports circulation', 'Immune system support'], ARRAY['Garlic extract 2000mg', 'Equivalent to fresh garlic'], 'Adults: Take 2 tablets daily with meals', 4.1, 356, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Heart Health', 'Cold, Flu & Immunity']),
('echinacea-immune', 'Echinacea Immune Defence', 'Premium echinacea extract to support natural immune system function and seasonal wellness.', 649750, 749750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Supports immune function', 'Seasonal wellness support', 'Natural defence system', 'Antioxidant properties'], ARRAY['Echinacea purpurea extract 400mg', 'Standardized to 4% phenolics'], 'Adults: Take 1 tablet twice daily', 4.4, 523, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY[]::TEXT[], ARRAY['Cold, Flu & Immunity']),
('green-tea-antioxidant', 'Green Tea Extract Antioxidant', 'Concentrated green tea extract rich in EGCG for powerful antioxidant protection and metabolism support.', 874750, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Herbs', ARRAY['Powerful antioxidant protection', 'Supports metabolism', 'Maintains cellular health', 'Supports weight management'], ARRAY['Green Tea extract 500mg', 'Providing EGCG 200mg', 'Caffeine 50mg'], 'Adults: Take 1 capsule daily with food', 4.5, 667, TRUE, FALSE, NULL, NULL, ARRAY['Women''s', 'Men''s'], ARRAY['Vitamin E'], ARRAY['General Health', 'Energy']),
('3', 'Blackmores Cranberry Forte 50,000', 'A concentrated cranberry extract to support urinary tract health.', 1424750, 1599750, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Women''s health', ARRAY['Supports urinary tract health', 'Concentrated cranberry extract', 'Antioxidant support', 'May help reduce occurrence of medically diagnosed cystitis'], ARRAY['Vaccinium macrocarpon (cranberry) juice dry 400 mg equivalent to fresh fruit 20 g (20,000 mg)', 'Vaccinium macrocarpon (cranberry) ext. dry conc. 60 mg equivalent to fresh fruit 30 g (30,000 mg)'], 'Adults: Maintenance of urinary tract health - Take 1 capsule once a day. Reduce occurrence of medically diagnosed cystitis and antioxidant support – Take 2 capsules once a day. Do not exceed 2 capsules in 24 hours. Take with food.', 4.6, 892, TRUE, FALSE, ARRAY['Always read the label and follow the directions for use.', 'If symptoms persist talk to your health professional.', 'Supplements may only be of assistance if dietary intake is inadequate.', 'If pain or irritation persists for more than 48 hours, consult your doctor.', 'If you are pregnant, breastfeeding, on warfarin therapy, or have pre-existing kidney conditions, talk to your health professional before use.', 'If you have any pre-existing conditions, or are on any medications always talk to your health professional before use.', 'Do not exceed 2 capsules in 24 hours. Take with food.'], '[{"id": "cranberry-90", "title": "90 capsules", "price": 1424750, "quantity": 90, "unit": "capsule", "pricePerUnit": "₫15,830 per capsule"}, {"id": "cranberry-30", "title": "30 capsules", "price": 675000, "quantity": 30, "unit": "capsule", "pricePerUnit": "₫22,500 per capsule"}]'::jsonb, ARRAY['Women''s'], ARRAY[]::TEXT[], ARRAY['General Health']),
('7', 'Blackmores Bio Iron Advanced', 'A lower constipation iron formulation which is gentle on the digestive system.', 462250, NULL, 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500', 'Women''s health', ARRAY['Superior iron absorption', 'Gentle on the digestive system', 'Lower constipation formula', 'Supports healthy iron levels'], ARRAY['Iron (II) glycinate (iron 20 mg) 73 mg', 'Ascorbic acid (vitamin C) 170 mg', 'Betacarotene 1.35 mg', 'Folic acid 300 microgram', 'Cyanocobalamin (vitamin B12) 50 microgram', 'Pyridoxine hydrochloride (vitamin B6, pyridoxine 5 mg) 6.08 mg', 'Riboflavin (vitamin B2) 1.3 mg'], 'Adults - Take 1 tablet once a day, or as professionally prescribed. Take with food.', 4.4, 567, TRUE, FALSE, ARRAY['Always read the label and follow the directions for use', 'If symptoms persist talk to your health professional', 'Supplements may only be of assistance if dietary intake is inadequate', 'Not for the treatment of iron deficiency conditions', 'If you are pregnant or breastfeeding, talk to your health professional before use', 'If you have any pre-existing conditions, or are on any medications always talk to your health professional before use'], '[{"id": "bio-iron-30", "title": "30 tablets", "price": 462250, "quantity": 30, "unit": "tablet", "pricePerUnit": "₫15,408 per tablet"}]'::jsonb, ARRAY['Women''s'], ARRAY['Iron'], ARRAY['General Health']);


-- 7. Insert initial data into promo_codes table
INSERT INTO public.promo_codes (code, discount, description, is_active, type, max_uses, current_uses) VALUES
('giadinhdaudau88', 50000, 'Giảm 50,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('khangbaby', 50000, 'Giảm 50,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('meemvoiday', 50000, 'Giảm 50,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('captainba', 50000, 'Giảm 50,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('metoannang', 50000, 'Giảm 50,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('mecaheo', 100000, 'Giảm 100,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0),
('sieuthitruongtho', 100000, 'Giảm 100,000đ cho đơn hàng', TRUE, 'multi-use', NULL, 0);


-- 8. Create the handle_promo_code_usage Function
CREATE OR REPLACE FUNCTION public.handle_promo_code_usage()
RETURNS TRIGGER AS $$
DECLARE
    promo_rec promo_codes%ROWTYPE;
BEGIN
    -- Only proceed if a promo code was applied to the new order
    IF NEW.promo_code_applied IS NOT NULL THEN
        -- Lock the promo code row to prevent race conditions during concurrent usage
        SELECT * INTO promo_rec FROM promo_codes WHERE code = NEW.promo_code_applied FOR UPDATE;

        -- Check if promo code exists and is active
        IF NOT FOUND OR NOT promo_rec.is_active THEN
            RAISE EXCEPTION 'Promo code "%" is invalid or inactive.', NEW.promo_code_applied;
        END IF;

        -- Check usage limits based on type
        IF promo_rec.type = 'unique' THEN
            IF promo_rec.current_uses >= 1 THEN
                RAISE EXCEPTION 'Unique promo code "%" has already been used.', NEW.promo_code_applied;
            END IF;
        ELSIF promo_rec.type = 'multi-use' THEN
            IF promo_rec.max_uses IS NOT NULL AND promo_rec.current_uses >= promo_rec.max_uses THEN
                RAISE EXCEPTION 'Multi-use promo code "%" has reached its maximum usage limit.', NEW.promo_code_applied;
            END IF;
        END IF;

        -- Update promo code usage in the promo_codes table
        UPDATE promo_codes
        SET
            current_uses = promo_rec.current_uses + 1,
            -- For unique codes, set is_active to FALSE after first use
            is_active = CASE WHEN promo_rec.type = 'unique' THEN FALSE ELSE promo_rec.is_active END
        WHERE code = NEW.promo_code_applied;

        -- Log the usage in the promo_code_usages table
        INSERT INTO promo_code_usages (promo_code, order_id, discount_amount_applied, user_id)
        VALUES (NEW.promo_code_applied, NEW.id, promo_rec.discount, NEW.user_id); -- Use NEW.user_id if available

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant Execution Privileges to the Function
-- These roles should be able to insert into the orders table.
GRANT EXECUTE ON FUNCTION public.handle_promo_code_usage() TO anon, authenticated;

-- 10. Create the after_order_insert_promo_code Trigger
CREATE TRIGGER after_order_insert_promo_code
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.promo_code_applied IS NOT NULL)
EXECUTE FUNCTION public.handle_promo_code_usage();


-- 11. Set up Row Level Security (RLS) Policies
-- Enable RLS on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usages ENABLE ROW LEVEL SECURITY;

-- Products Table Policies
-- All users can read product information
CREATE POLICY "Enable read access for all users" ON public.products
FOR SELECT USING (TRUE);
-- Only service_role can insert, update, or delete products
CREATE POLICY "Enable service role full access on products" ON public.products
FOR ALL USING (auth.role() = 'service_role');

-- Promo Codes Table Policies
-- All users can read active promo codes for validation
CREATE POLICY "Enable read access for active promo codes" ON public.promo_codes
FOR SELECT USING (is_active = TRUE);
-- Only service_role can insert, update, or delete promo codes
CREATE POLICY "Enable service role full access on promo_codes" ON public.promo_codes
FOR ALL USING (auth.role() = 'service_role');

-- Orders Table Policies
-- Allow anonymous and authenticated users to insert new orders
CREATE POLICY "Allow anon and authenticated insert orders" ON public.orders
FOR INSERT WITH CHECK (TRUE);
-- Authenticated users can read their own orders
CREATE POLICY "Enable read access for own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id);
-- Only service_role can update or delete orders
CREATE POLICY "Enable service role update/delete on orders" ON public.orders
FOR ALL USING (auth.role() = 'service_role');

-- Order Items Table Policies
-- Allow anonymous and authenticated users to insert new order items
CREATE POLICY "Allow anon and authenticated insert order_items" ON public.order_items
FOR INSERT WITH CHECK (TRUE);
-- Authenticated users can read order items associated with their own orders
CREATE POLICY "Enable read access for own order items" ON public.order_items
FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
-- Only service_role can update or delete order items
CREATE POLICY "Enable service role update/delete on order_items" ON public.order_items
FOR ALL USING (auth.role() = 'service_role');

-- Promo Code Usages Table Policies
-- Only service_role has full access (insertions are primarily via trigger)
CREATE POLICY "Enable service role full access on promo_code_usages" ON public.promo_code_usages
FOR ALL USING (auth.role() = 'service_role');