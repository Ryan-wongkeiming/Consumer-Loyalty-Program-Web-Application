-- ============================================================================
-- CareHub — CONSOLIDATED FULL DATABASE SCRIPT
-- ============================================================================
-- This single file recreates the ENTIRE live database state:
--   Part 1: original project schema (archived migrations, 2025-08)
--   Part 2: CareHub rebrand + multi-brand changes (2026-09-16)
--
-- Usage: paste this entire file into the Supabase SQL Editor and Run.
-- Target: a FRESH database (do NOT run on a database that already has data).
--
-- Product catalog after this script:
--   18 Blackmores + 19 GAIA Skin Naturals + 18 LittleOak (3 cans, 3 sachets, 12 combos) = 55 products
-- ============================================================================


-- ============================================================
-- ORIGINAL MIGRATION: 20250810142215_dusty_bridge.sql
-- ============================================================
-- Fix RLS policy for orders table to allow anonymous users to create orders
-- This addresses the "new row violates row-level security policy" error

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;

-- Create a new policy that properly allows anonymous users to insert orders
-- This allows anyone (including anonymous users) to create orders
CREATE POLICY "Allow anonymous order creation" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Also fix the order_items policy to match
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;

CREATE POLICY "Allow anonymous order items creation" ON public.order_items
FOR INSERT 
TO anon, authenticated  
WITH CHECK (true);

-- ============================================================
-- ORIGINAL MIGRATION: 20250810142413_floating_brook.sql
-- ============================================================
-- Fix RLS policies for orders and order_items tables to allow anonymous checkout

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;

-- Create new INSERT policy for orders table that allows both anonymous and authenticated users
CREATE POLICY "Allow anonymous and authenticated users to insert orders" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create new INSERT policy for order_items table that allows both anonymous and authenticated users  
CREATE POLICY "Allow anonymous and authenticated users to insert order items" ON public.order_items
FOR INSERT
TO anon, authenticated  
WITH CHECK (true);

-- ============================================================
-- ORIGINAL MIGRATION: 20250810143558_bright_violet.sql
-- ============================================================


-- ============================================================
-- ORIGINAL MIGRATION: 20250810144000_aged_snowflake.sql
-- ============================================================
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

-- ============================================================
-- ORIGINAL MIGRATION: 20250810144931_azure_recipe.sql
-- ============================================================
-- Fix RLS policies for orders and order_items tables to allow anonymous checkout

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;

-- Create new INSERT policies that properly allow anonymous and authenticated users
CREATE POLICY "Allow anon and authenticated insert orders" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow anon and authenticated insert order_items" ON public.order_items
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- ============================================================
-- ORIGINAL MIGRATION: 20250810145109_empty_frog.sql
-- ============================================================
-- Fix RLS policies for orders and order_items to allow anonymous checkout
-- This addresses the "new row violates row-level security policy" error

-- Drop existing INSERT policies that may be causing conflicts
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;

-- Create new INSERT policy for orders table that allows both authenticated and anonymous users
CREATE POLICY "Enable insert for authenticated and anonymous users" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Create new INSERT policy for order_items table that allows both authenticated and anonymous users  
CREATE POLICY "Enable insert for authenticated and anonymous users" ON public.order_items
FOR INSERT
TO anon, authenticated  
WITH CHECK (true);

-- Ensure the policies are properly applied
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- ORIGINAL MIGRATION: 20250810145242_holy_paper.sql
-- ============================================================
-- Fix RLS policies for orders and order_items tables to allow anonymous checkout
-- This addresses the "new row violates row-level security policy" error

-- First, drop all existing policies on orders table
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable service role update/delete on orders" ON public.orders;

-- Drop all existing policies on order_items table
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable service role update/delete on order_items" ON public.order_items;

-- Create new comprehensive policies for orders table
-- Allow INSERT for both authenticated users and anonymous users
CREATE POLICY "Enable INSERT for all users" ON public.orders
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow SELECT for users to read their own orders (authenticated) or service role
CREATE POLICY "Enable SELECT for own orders" ON public.orders
FOR SELECT 
TO authenticated, service_role
USING (
  (auth.uid() = user_id) OR 
  (auth.role() = 'service_role')
);

-- Allow UPDATE/DELETE only for service role
CREATE POLICY "Enable UPDATE/DELETE for service role" ON public.orders
FOR ALL 
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create new comprehensive policies for order_items table
-- Allow INSERT for both authenticated users and anonymous users
CREATE POLICY "Enable INSERT for all users" ON public.order_items
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow SELECT for users to read order items from their own orders or service role
CREATE POLICY "Enable SELECT for own order items" ON public.order_items
FOR SELECT 
TO authenticated, service_role
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.role() = 'service_role')
  )
);

-- Allow UPDATE/DELETE only for service role
CREATE POLICY "Enable UPDATE/DELETE for service role" ON public.order_items
FOR ALL 
TO service_role
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Ensure RLS is enabled on both tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to anon role
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- ORIGINAL MIGRATION: 20250810145527_orange_dune.sql
-- ============================================================
-- Disable RLS on orders and order_items tables to allow anonymous checkout
-- This is a temporary fix to resolve the checkout issue

-- Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on order_items table  
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on orders table
DROP POLICY IF EXISTS "Allow anon and authenticated insert orders" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for own orders" ON public.orders;
DROP POLICY IF EXISTS "Enable service role update/delete on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow INSERT for anon and authenticated users" ON public.orders;

-- Drop all existing policies on order_items table
DROP POLICY IF EXISTS "Allow anon and authenticated insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for own order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable service role update/delete on order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow INSERT for anon and authenticated users" ON public.order_items;

-- Note: With RLS disabled, all users can perform all operations on these tables
-- This resolves the immediate checkout issue but reduces security
-- Consider re-enabling RLS with proper policies once the issue is resolved

-- ============================================================
-- ORIGINAL MIGRATION: 20250811133632_holy_villa.sql
-- ============================================================
/*
# Add multiple images support to products table

1. Schema Changes
   - Add `images` column of type TEXT[] to store multiple image URLs
   - Update existing products with sample image arrays
   - Maintain backward compatibility with existing `image` column

2. Data Migration
   - Populate new `images` column with sample data for existing products
   - Each product will have 3-5 different image URLs for gallery display
*/

-- Add images column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Update existing products with sample image arrays
-- Using different Pexels images for variety
UPDATE public.products SET images = ARRAY[
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683073/pexels-photo-3683073.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id = 'blackmores-subscribe';

UPDATE public.products SET images = ARRAY[
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id = 'Blackmores Newborn Formula';

UPDATE public.products SET images = ARRAY[
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683073/pexels-photo-3683073.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id = 'Blackmores Follow-on Formula';

UPDATE public.products SET images = ARRAY[
  'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id = 'Blackmores Toddler Milk Drink';

-- Update all other products with varied image arrays
UPDATE public.products SET images = ARRAY[
  image, -- Keep original image as first
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021769/pexels-photo-4021769.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE images IS NULL AND image IS NOT NULL;

-- For products without any image, set a default array
UPDATE public.products SET images = ARRAY[
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE images IS NULL AND image IS NULL;

-- ============================================================
-- ORIGINAL MIGRATION: 20250813145646_crystal_star.sql
-- ============================================================
/*
  # Create OCR Rate Limits Table

  1. New Tables
    - `ocr_rate_limits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `request_count` (integer, number of requests)
      - `created_at` (timestamp, when the rate limit entry was created)

  2. Security
    - Enable RLS on `ocr_rate_limits` table
    - Add policies for service role access only
    - Add index for efficient rate limit queries

  3. Purpose
    - Track OCR API usage per user to prevent abuse
    - Implement rate limiting for the camera capture feature
*/

-- Create the OCR rate limits table
CREATE TABLE IF NOT EXISTS public.ocr_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ocr_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ocr_rate_limits table
CREATE POLICY "Enable service role full access on ocr_rate_limits"
ON public.ocr_rate_limits FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Prevent direct access by regular users (only service role should manage this)
CREATE POLICY "Prevent direct user access to ocr_rate_limits"
ON public.ocr_rate_limits FOR ALL
TO authenticated, anon
USING (false) WITH CHECK (false);

-- Create indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_user_id ON public.ocr_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_created_at ON public.ocr_rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_ocr_rate_limits_user_time ON public.ocr_rate_limits(user_id, created_at);

-- ============================================================
-- ORIGINAL MIGRATION: 20250817050645_tiny_lagoon.sql
-- ============================================================
/*
# Complete Authentication and User Profiles Setup

1. New Tables
   - `user_profiles` - Extended user information and preferences
   - Update existing tables to properly link with authenticated users

2. Security
   - Enable RLS on all tables with comprehensive policies
   - Proper SELECT, INSERT, UPDATE, DELETE policies for each table
   - Anonymous user support where needed
   - Authenticated user access controls

3. Authentication Setup
   - Email confirmation disabled for smooth user journey
   - User profiles automatically created on signup
   - Proper foreign key relationships

4. Data Integrity
   - Proper constraints and indexes
   - Cascading deletes where appropriate
   - Default values for better UX
*/

-- Create user_profiles table for extended user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  phone text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  marketing_consent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add user_id column to orders table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add user_id column to promo_code_usages table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_code_usages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.promo_code_usages ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create wishlist table for user favorites
CREATE TABLE IF NOT EXISTS public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Create user_addresses table for saved addresses
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  ward text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trigger for user_addresses updated_at
CREATE TRIGGER handle_user_addresses_updated_at
  BEFORE UPDATE ON public.user_addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist(product_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usages_user_id ON public.promo_code_usages(user_id);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on existing tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles table
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role full access on user_profiles" ON public.user_profiles
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for products table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable service role full access on products" ON public.products;

CREATE POLICY "Anyone can view products" ON public.products
FOR SELECT USING (true);

CREATE POLICY "Service role full access on products" ON public.products
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for promo_codes table
DROP POLICY IF EXISTS "Enable read access for active promo codes" ON public.promo_codes;
DROP POLICY IF EXISTS "Enable service role full access on promo_codes" ON public.promo_codes;

CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes
FOR SELECT USING (is_active = true);

CREATE POLICY "Service role full access on promo_codes" ON public.promo_codes
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for orders table (Updated to work with existing disabled RLS)
-- Note: RLS is currently disabled on orders table, but adding policies for when it's re-enabled
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Anyone can create orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own orders" ON public.orders
FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can delete orders" ON public.orders
FOR DELETE USING (auth.role() = 'service_role');

-- RLS Policies for order_items table (Updated to work with existing disabled RLS)
CREATE POLICY "Users can view own order items" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.role() = 'service_role')
  ) OR auth.role() = 'service_role'
);

CREATE POLICY "Anyone can create order items" ON public.order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can modify order items" ON public.order_items
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for promo_code_usages table
DROP POLICY IF EXISTS "Enable service role full access on promo_code_usages" ON public.promo_code_usages;

CREATE POLICY "Users can view own promo code usage" ON public.promo_code_usages
FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role full access on promo_code_usages" ON public.promo_code_usages
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for wishlist table
CREATE POLICY "Users can view own wishlist" ON public.wishlist
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own wishlist" ON public.wishlist
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on wishlist" ON public.wishlist
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_addresses table
CREATE POLICY "Users can view own addresses" ON public.user_addresses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own addresses" ON public.user_addresses
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on user_addresses" ON public.user_addresses
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for ocr_rate_limits table (already exists but ensuring consistency)
DROP POLICY IF EXISTS "Enable service role full access on ocr_rate_limits" ON public.ocr_rate_limits;
DROP POLICY IF EXISTS "Prevent direct user access to ocr_rate_limits" ON public.ocr_rate_limits;

CREATE POLICY "Service role full access on ocr_rate_limits" ON public.ocr_rate_limits
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Prevent direct user access to ocr_rate_limits" ON public.ocr_rate_limits
FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant specific permissions to authenticated users
GRANT SELECT ON public.products TO authenticated, anon;
GRANT SELECT ON public.promo_codes TO authenticated, anon;
GRANT INSERT ON public.orders TO authenticated, anon;
GRANT INSERT ON public.order_items TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_addresses TO authenticated;

-- Create function to get user profile with safe defaults
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  date_of_birth date,
  gender text,
  avatar_url text,
  preferences jsonb,
  marketing_consent boolean,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.phone,
    up.date_of_birth,
    up.gender,
    up.avatar_url,
    up.preferences,
    up.marketing_consent,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  WHERE up.id = user_uuid;
$$;

-- Create function to get user's order history
CREATE OR REPLACE FUNCTION public.get_user_orders(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE (
  id uuid,
  full_name text,
  phone text,
  email text,
  address text,
  city text,
  ward text,
  notes text,
  total_amount bigint,
  promo_code_applied text,
  created_at timestamptz,
  status text,
  items jsonb
) 
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT 
    o.id,
    o.full_name,
    o.phone,
    o.email,
    o.address,
    o.city,
    o.ward,
    o.notes,
    o.total_amount,
    o.promo_code_applied,
    o.created_at,
    o.status,
    COALESCE(
      json_agg(
        json_build_object(
          'product_name', oi.product_name,
          'quantity', oi.quantity,
          'price_at_purchase', oi.price_at_purchase,
          'is_subscription', oi.is_subscription,
          'delivery_frequency', oi.delivery_frequency
        )
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::json
    )::jsonb as items
  FROM public.orders o
  LEFT JOIN public.order_items oi ON o.id = oi.order_id
  WHERE o.user_id = user_uuid
  GROUP BY o.id, o.full_name, o.phone, o.email, o.address, o.city, o.ward, o.notes, o.total_amount, o.promo_code_applied, o.created_at, o.status
  ORDER BY o.created_at DESC;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_orders(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- ORIGINAL MIGRATION: 20250817082339_yellow_cave.sql
-- ============================================================
/*
  # Create messages table for user reviews and messages

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (text, foreign key to products, nullable)
      - `content` (text, message content)
      - `message_type` (text, type: text/image/video)
      - `media_url` (text, URL to uploaded media, nullable)
      - `media_thumbnail` (text, thumbnail URL for videos, nullable)
      - `rating` (integer, 1-5 stars for product reviews, nullable)
      - `is_approved` (boolean, for moderation, default true)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policy for users to insert their own messages
    - Add policy for anyone to read approved messages
    - Add policy for service role to manage all messages

  3. Storage
    - Create media bucket for file uploads
    - Set up storage policies for authenticated users
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text REFERENCES products(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text',
  media_url text,
  media_thumbnail text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved messages"
  ON messages
  FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Users can view own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_approved = true);

CREATE POLICY "Users can update own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON messages(product_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_approved ON messages(is_approved);

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Anyone can view media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Users can update own media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- ORIGINAL MIGRATION: 20250821144914_emerald_dune.sql
-- ============================================================
/*
  # Create Loyalty System Tables

  1. New Tables
    - `loyalty_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique, not null)
      - `points` (integer, not null)
      - `is_redeemed` (boolean, default false)
      - `redeemed_by_user_id` (uuid, foreign key to auth.users)
      - `redeemed_at` (timestamptz, nullable)
    
    - `user_loyalty_points`
      - `user_id` (uuid, primary key, foreign key to auth.users)
      - `total_points` (integer, default 0)
      - `last_updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
    - Service role has full access for backend operations
    - Users can only view their own loyalty points

  3. Sample Data
    - Insert sample loyalty codes for testing
*/

-- Create loyalty_codes table
CREATE TABLE IF NOT EXISTS loyalty_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  is_redeemed boolean DEFAULT false NOT NULL,
  redeemed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_loyalty_points table
CREATE TABLE IF NOT EXISTS user_loyalty_points (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0 NOT NULL CHECK (total_points >= 0),
  last_updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE loyalty_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loyalty_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_codes
CREATE POLICY "Service role full access on loyalty_codes"
  ON loyalty_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Prevent direct user access to loyalty_codes"
  ON loyalty_codes
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- RLS Policies for user_loyalty_points
CREATE POLICY "Service role full access on user_loyalty_points"
  ON user_loyalty_points
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view own loyalty points"
  ON user_loyalty_points
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update last_updated_at
CREATE OR REPLACE FUNCTION handle_loyalty_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp update
DROP TRIGGER IF EXISTS handle_loyalty_points_updated_at ON user_loyalty_points;
CREATE TRIGGER handle_loyalty_points_updated_at
  BEFORE UPDATE ON user_loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION handle_loyalty_points_updated_at();

-- Insert sample loyalty codes for testing
INSERT INTO loyalty_codes (code, points) VALUES
  ('BLACKMORES2025', 100),
  ('HEALTH50', 50),
  ('WELLNESS25', 25),
  ('VITAMIN100', 100),
  ('NATURAL75', 75),
  ('IMMUNITY30', 30),
  ('ENERGY40', 40),
  ('CALCIUM60', 60),
  ('OMEGA80', 80),
  ('PROBIOTIC45', 45)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ORIGINAL MIGRATION: 20250821150031_flat_math.sql
-- ============================================================
/*
  # Add foreign key relationship between messages and user_profiles

  1. Changes
    - Add foreign key constraint on messages.user_id referencing user_profiles.id
    - This enables Supabase to properly join messages with user_profiles data

  2. Security
    - No RLS changes needed as existing policies remain intact
*/

-- Add foreign key constraint to establish relationship between messages and user_profiles
DO $$
BEGIN
  -- Check if the foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_user_id_user_profiles_fkey'
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE messages 
    ADD CONSTRAINT messages_user_id_user_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ============================================================
-- ORIGINAL MIGRATION: 20250821155228_little_mountain.sql
-- ============================================================
/*
  # Create loyalty gifts and redemptions system

  1. New Tables
    - `loyalty_gifts`
      - `id` (uuid, primary key)
      - `name` (text, gift name)
      - `description` (text, gift description)
      - `points_required` (integer, points needed to redeem)
      - `image_url` (text, gift image)
      - `stock` (integer, available quantity)
      - `is_active` (boolean, whether gift is available)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `loyalty_redemptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `gift_id` (uuid, foreign key to loyalty_gifts)
      - `points_spent` (integer, points deducted)
      - `status` (text, redemption status)
      - `redeemed_at` (timestamp)
      - `notes` (text, optional notes)

  2. Security
    - Enable RLS on both tables
    - Public can view active loyalty gifts
    - Only service_role can manage gifts
    - Users can view their own redemptions
    - Only service_role can create redemptions

  3. Sample Data
    - Insert attractive loyalty gifts with proper point values
    - Include high-quality Pexels images for each gift
*/

-- Create loyalty_gifts table
CREATE TABLE IF NOT EXISTS public.loyalty_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points_required integer NOT NULL CHECK (points_required > 0),
  image_url text,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS public.loyalty_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_id uuid NOT NULL REFERENCES public.loyalty_gifts(id) ON DELETE CASCADE,
  points_spent integer NOT NULL CHECK (points_spent > 0),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  redeemed_at timestamptz DEFAULT now() NOT NULL,
  notes text
);

-- Enable RLS on loyalty_gifts
ALTER TABLE public.loyalty_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_gifts
-- Public can view active gifts
CREATE POLICY "Public can view active loyalty gifts" ON public.loyalty_gifts
FOR SELECT USING (is_active = true);

-- Only service_role can manage gifts
CREATE POLICY "Service role can manage loyalty gifts" ON public.loyalty_gifts
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on loyalty_redemptions
ALTER TABLE public.loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for loyalty_redemptions
-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON public.loyalty_redemptions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Only service_role can create/manage redemptions
CREATE POLICY "Service role can manage redemptions" ON public.loyalty_redemptions
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to loyalty_gifts
DROP TRIGGER IF EXISTS handle_loyalty_gifts_updated_at ON public.loyalty_gifts;
CREATE TRIGGER handle_loyalty_gifts_updated_at
  BEFORE UPDATE ON public.loyalty_gifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample loyalty gifts
INSERT INTO public.loyalty_gifts (name, description, points_required, image_url, stock, is_active)
VALUES
  ('Blackmores Premium Water Bottle', 'A high-quality, eco-friendly water bottle to encourage hydration.', 500, 'https://images.pexels.com/photos/1037993/pexels-photo-1037993.jpeg?auto=compress&cs=tinysrgb&w=800', 100, true),
  ('Exclusive Blackmores Sample Pack', 'A curated selection of new or popular product samples.', 500, 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800', 150, true),
  ('Digital Wellness Guide', 'An exclusive e-book on foundational nutrition and healthy living tips.', 500, 'https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('Blackmores Branded Wellness Journal', 'A beautifully designed journal for tracking health goals and mood.', 1500, 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800', 75, true),
  ('Aromatherapy Diffuser + Signature Blend', 'A compact diffuser with a custom essential oil blend for relaxation.', 1500, 'https://images.pexels.com/photos/3987130/pexels-photo-3987130.jpeg?auto=compress&cs=tinysrgb&w=800', 50, true),
  ('Premium Organic Tea Collection', 'A selection of high-quality organic herbal teas for health benefits.', 1500, 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=800', 80, true),
  ('Blackmores Immunity Boost Bundle', 'A full-sized bundle of complementary Blackmores products for immunity.', 3000, 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=800', 30, true),
  ('Virtual Wellness Workshop Access', 'Free enrollment in an exclusive online workshop with a nutritionist.', 3000, 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('High-Quality Yoga Mat', 'A durable and comfortable yoga mat for your fitness routine.', 3000, 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', 40, true),
  ('Personalized Health Consultation', 'A one-on-one virtual consultation with a certified health expert.', 5000, 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800', 10, true),
  ('Limited Edition Blackmores Product', 'An exclusive, high-value product not available for general purchase.', 5000, 'https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=800', 5, true),
  ('Luxury Natural Skincare Set', 'A set of premium, natural skincare products aligning with natural health.', 5000, 'https://images.pexels.com/photos/3987131/pexels-photo-3987131.jpeg?auto=compress&cs=tinysrgb&w=800', 15, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ORIGINAL MIGRATION: 20250821155259_misty_dust.sql
-- ============================================================
/*
  # Comprehensive RLS Policy Audit and Fixes

  1. Security Fixes
    - Fix overly permissive policies on orders and order_items
    - Ensure proper role-based access control
    - Add missing WITH CHECK clauses for INSERT/UPDATE operations
    - Enable RLS on public tables for consistency

  2. Tables Updated
    - orders: Fix INSERT/UPDATE policies for authenticated vs anonymous users
    - order_items: Ensure proper relationship validation
    - user_profiles: Strengthen user-specific access
    - user_addresses: Fix role-based access
    - wishlist: Ensure proper user ownership validation
    - messages: Strengthen content moderation policies
    - womens_health_products: Enable RLS for consistency
    - womens_health_product_skus: Enable RLS for consistency
    - articles: Enable RLS for consistency
    - topics: Enable RLS for consistency

  3. Security Principles Applied
    - Authenticated users can only access their own data
    - Anonymous users have limited INSERT access where appropriate
    - Service role has full administrative access
    - Public data is readable by everyone but only manageable by service role
*/

-- 1. Fix orders table policies
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Correct policies for orders
CREATE POLICY "Authenticated users can insert own orders" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can insert orders" ON public.orders
FOR INSERT TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated users can update own orders" ON public.orders
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. Fix order_items table policies
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Enable INSERT for all users" ON public.order_items;

-- Correct policies for order_items
CREATE POLICY "Authenticated users can insert order items for own orders" ON public.order_items
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Anonymous users can insert order items for anonymous orders" ON public.order_items
FOR INSERT TO anon
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_items.order_id 
  AND orders.user_id IS NULL
));

-- 3. Fix user_profiles table policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Authenticated users can view own profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Authenticated users can update own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Fix user_addresses table policies
DROP POLICY IF EXISTS "Users can manage own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.user_addresses;

CREATE POLICY "Authenticated users can view own addresses" ON public.user_addresses
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own addresses" ON public.user_addresses
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own addresses" ON public.user_addresses
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own addresses" ON public.user_addresses
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 5. Fix wishlist table policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist;

CREATE POLICY "Authenticated users can view own wishlist" ON public.wishlist
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own wishlist" ON public.wishlist
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own wishlist" ON public.wishlist
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own wishlist" ON public.wishlist
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 6. Fix messages table policies
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Authenticated users can view own and approved messages" ON public.messages
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_approved = true);

CREATE POLICY "Authenticated users can insert own messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own messages" ON public.messages
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own messages" ON public.messages
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 7. Enable RLS and add policies for public-facing tables
-- womens_health_products
ALTER TABLE public.womens_health_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view womens_health_products" ON public.womens_health_products;
CREATE POLICY "Public can view womens_health_products" ON public.womens_health_products
FOR SELECT USING (true);

CREATE POLICY "Service role can manage womens_health_products" ON public.womens_health_products
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- womens_health_product_skus
ALTER TABLE public.womens_health_product_skus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view womens_health_product_skus" ON public.womens_health_product_skus;
CREATE POLICY "Public can view womens_health_product_skus" ON public.womens_health_product_skus
FOR SELECT USING (true);

CREATE POLICY "Service role can manage womens_health_product_skus" ON public.womens_health_product_skus
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view articles" ON public.articles;
CREATE POLICY "Public can view articles" ON public.articles
FOR SELECT USING (true);

CREATE POLICY "Service role can manage articles" ON public.articles
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view topics" ON public.topics;
CREATE POLICY "Public can view topics" ON public.topics
FOR SELECT USING (true);

CREATE POLICY "Service role can manage topics" ON public.topics
FOR ALL USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to loyalty_gifts
DROP TRIGGER IF EXISTS handle_loyalty_gifts_updated_at ON public.loyalty_gifts;
CREATE TRIGGER handle_loyalty_gifts_updated_at
  BEFORE UPDATE ON public.loyalty_gifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample loyalty gifts
INSERT INTO public.loyalty_gifts (name, description, points_required, image_url, stock, is_active)
VALUES
  ('Blackmores Premium Water Bottle', 'A high-quality, eco-friendly water bottle to encourage hydration.', 500, 'https://images.pexels.com/photos/1037993/pexels-photo-1037993.jpeg?auto=compress&cs=tinysrgb&w=800', 100, true),
  ('Exclusive Blackmores Sample Pack', 'A curated selection of new or popular product samples.', 500, 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=800', 150, true),
  ('Digital Wellness Guide', 'An exclusive e-book on foundational nutrition and healthy living tips.', 500, 'https://images.pexels.com/photos/3747468/pexels-photo-3747468.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('Blackmores Branded Wellness Journal', 'A beautifully designed journal for tracking health goals and mood.', 1500, 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=800', 75, true),
  ('Aromatherapy Diffuser + Signature Blend', 'A compact diffuser with a custom essential oil blend for relaxation.', 1500, 'https://images.pexels.com/photos/3987130/pexels-photo-3987130.jpeg?auto=compress&cs=tinysrgb&w=800', 50, true),
  ('Premium Organic Tea Collection', 'A selection of high-quality organic herbal teas for health benefits.', 1500, 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=800', 80, true),
  ('Blackmores Immunity Boost Bundle', 'A full-sized bundle of complementary Blackmores products for immunity.', 3000, 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=800', 30, true),
  ('Virtual Wellness Workshop Access', 'Free enrollment in an exclusive online workshop with a nutritionist.', 3000, 'https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800', 9999, true),
  ('High-Quality Yoga Mat', 'A durable and comfortable yoga mat for your fitness routine.', 3000, 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=800', 40, true),
  ('Personalized Health Consultation', 'A one-on-one virtual consultation with a certified health expert.', 5000, 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800', 10, true),
  ('Limited Edition Blackmores Product', 'An exclusive, high-value product not available for general purchase.', 5000, 'https://images.pexels.com/photos/4041390/pexels-photo-4041390.jpeg?auto=compress&cs=tinysrgb&w=800', 5, true),
  ('Luxury Natural Skincare Set', 'A set of premium, natural skincare products aligning with natural health.', 5000, 'https://images.pexels.com/photos/3987131/pexels-photo-3987131.jpeg?auto=compress&cs=tinysrgb&w=800', 15, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ORIGINAL MIGRATION: 20250821163046_graceful_wind.sql
-- ============================================================
/*
  # Add shipping columns to loyalty_redemptions table

  1. Schema Changes
    - Add `full_name` column to store recipient's full name
    - Add `phone` column to store recipient's phone number
    - Add `email` column to store recipient's email (nullable)
    - Add `address` column to store street address
    - Add `city` column to store city/province
    - Add `ward` column to store ward/district

  2. Purpose
    - Enable storing complete shipping information for gift redemptions
    - Support the gift redemption confirmation flow
    - Ensure proper delivery of redeemed loyalty gifts
*/

-- Add shipping columns to loyalty_redemptions table
DO $$
BEGIN
  -- Add full_name column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN full_name text;
  END IF;

  -- Add phone column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'phone'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN phone text;
  END IF;

  -- Add email column if it doesn't exist (nullable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'email'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN email text;
  END IF;

  -- Add address column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'address'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN address text;
  END IF;

  -- Add city column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'city'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN city text;
  END IF;

  -- Add ward column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_redemptions' AND column_name = 'ward'
  ) THEN
    ALTER TABLE loyalty_redemptions ADD COLUMN ward text;
  END IF;
END $$;

-- ============================================================
-- ORIGINAL MIGRATION: 20250829164833_cool_bar.sql
-- ============================================================
/*
  # Create free_samples table

  1. New Tables
    - `free_samples`
      - `id` (text, primary key) - unique identifier for sample type
      - `name` (text) - display name of the sample
      - `description` (text, optional) - description of the sample
      - `stock` (integer) - available stock count
      - `is_active` (boolean) - whether the sample is currently available
      - `created_at` (timestamp) - when the sample type was created
      - `updated_at` (timestamp) - when the sample type was last updated

  2. Security
    - Enable RLS on `free_samples` table
    - Add policy for public read access to active samples
    - Add policy for service role full access

  3. Sample Data
    - Insert initial sample types with stock
*/

CREATE TABLE IF NOT EXISTS free_samples (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE free_samples ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view active free samples"
  ON free_samples
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role full access on free_samples"
  ON free_samples
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO free_samples (id, name, description, stock, is_active) VALUES
  ('blackmores-pregnancy-gold', 'Blackmores Pregnancy & Breast-feeding Gold', 'Vitamin tổng hợp cho mẹ bầu và cho con bú', 100, true),
  ('blackmores-kids-multi', 'Blackmores Kids Multi', 'Vitamin tổng hợp cho trẻ em', 50, true)
ON CONFLICT (id) DO NOTHING;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'handle_free_samples_updated_at'
  ) THEN
    CREATE TRIGGER handle_free_samples_updated_at
      BEFORE UPDATE ON free_samples
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- ============================================================
-- ORIGINAL MIGRATION: 20250829164844_old_bridge.sql
-- ============================================================
/*
  # Add sample_type_id to free_sample_requests table

  1. Changes
    - Add `sample_type_id` column to `free_sample_requests` table
    - Add foreign key constraint to reference `free_samples` table
    - Make the column optional to maintain compatibility with existing data

  2. Security
    - No RLS changes needed as the table already has appropriate policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'free_sample_requests' AND column_name = 'sample_type_id'
  ) THEN
    ALTER TABLE free_sample_requests ADD COLUMN sample_type_id text;
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'free_sample_requests_sample_type_id_fkey'
  ) THEN
    ALTER TABLE free_sample_requests 
    ADD CONSTRAINT free_sample_requests_sample_type_id_fkey 
    FOREIGN KEY (sample_type_id) REFERENCES free_samples(id);
  END IF;
END $$;


-- ============================================================================
-- PART 2 — CareHub changes
-- ============================================================================

-- ============================================================
-- CARHUB MIGRATION: 20260916000000_carehub_rebrand.sql
-- ============================================================
-- CareHub rebrand migration
-- Strips the "Blackmores" brand prefix from product display names and
-- descriptions, and rebrands loyalty gift names. The site is now CareHub,
-- a multi-brand storefront, so product names should describe the product
-- rather than the original manufacturer.
--
-- ID slugs (product ids) are intentionally left unchanged: they are used in
-- URLs (/product/:id), wishlist rows, order items and other references, so
-- renaming them would break deep links and joins.

-- 1. Products: strip "Blackmores " (and "Blackmores® ") prefix from names
UPDATE public.products
SET name = trim(regexp_replace(name, '^Blackmores(®|™)?\s+', '', 'i'))
WHERE name ILIKE 'Blackmores%';

-- 2. Products: strip "Blackmores" / "Blackmores®" brand mentions from descriptions
UPDATE public.products
SET description = trim(regexp_replace(description, 'Blackmores(®|™)?\s*', '', 'i'))
WHERE description ILIKE '%Blackmores%';

-- 3. Loyalty gifts: rebrand names
UPDATE public.loyalty_gifts
SET name = CASE
  WHEN name = 'Blackmores Premium Water Bottle' THEN 'CareHub Premium Water Bottle'
  WHEN name = 'Exclusive Blackmores Sample Pack' THEN 'Exclusive CareHub Sample Pack'
  WHEN name = 'Blackmores Branded Wellness Journal' THEN 'CareHub Wellness Journal'
  WHEN name = 'Blackmores Immunity Boost Bundle' THEN 'CareHub Immunity Boost Bundle'
  WHEN name = 'Limited Edition Blackmores Product' THEN 'Limited Edition CareHub Product'
  ELSE name
END
WHERE name ILIKE '%Blackmores%';

-- 4. Loyalty gift descriptions: strip brand mentions
UPDATE public.loyalty_gifts
SET description = trim(regexp_replace(description, 'Blackmores(®|™)?\s*', '', 'i'))
WHERE description ILIKE '%Blackmores%';

-- 5. Free samples: rebrand product names if present
UPDATE public.free_samples
SET name = trim(regexp_replace(name, '^Blackmores(®|™)?\s+', '', 'i'))
WHERE name ILIKE 'Blackmores%';

-- 6. Demo loyalty code placeholder rebrand (if the 2025 code still exists)
UPDATE public.loyalty_codes
SET code = 'CAREHUB2025'
WHERE code = 'BLACKMORES2025';

-- ============================================================
-- CARHUB MIGRATION: 20260916000001_carehub_multibrand.sql
-- ============================================================
-- CareHub multi-brand migration
-- Adds brand columns to products and seeds the first non-CareHub brands:
--   - GAIA Skin Naturals (Australian baby skincare)
--   - The Little Oak Company (goat milk infant formula)
--
-- Design notes:
--   * brand        = display name shown on cards/detail
--   * brand_slug   = stable filter key used by the frontend
--   * Existing CareHub products get brand = 'CareHub', brand_slug = 'carehub'
--   * New categories are additive; the frontend category list lives in
--     src/data/products.ts (categories array) and must be kept in sync.
--   * Prices are in VND to match the storefront currency.

ALTER TABLE public.products
  ADD COLUMN brand TEXT NOT NULL DEFAULT 'CareHub',
  ADD COLUMN brand_slug TEXT NOT NULL DEFAULT 'carehub';

-- Index brand_slug for fast filtering
CREATE INDEX IF NOT EXISTS products_brand_slug_idx ON public.products (brand_slug);

-- ============================================================
-- GAIA Skin Naturals — baby bath time
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'gaia-sleeptime-wash', 'Sleeptime Wash', 'Calming lavender-based wash for baby bedtime routine. Gently cleanses while soothing baby to sleep with a relaxing aromatic blend.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Bath Time',
  ARRAY['Calming bedtime routine', 'Gentle plant-based cleanse', 'Suitable from birth', 'Cruelty free'],
  ARRAY['Lavender oil', 'Calendula extract', 'Evening primrose oil', 'Aloe vera'],
  'Apply to wet hair and body, massage gently, rinse thoroughly.', 4.5, 464, TRUE, FALSE,
  ARRAY['For external use only', 'Discontinue if irritation occurs'],
  '[{"id": "gaia-sleeptime-wash-500ml", "unit": "chai", "price": 178000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Calendula'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-hair-body-wash', 'Hair & Body Wash', '2-in-1 gentle cleanser for baby hair and body. Plant-based formula that cleans without stripping natural oils.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Bath Time',
  ARRAY['2-in-1 hair & body', 'Plant-based formula', 'No synthetic fragrance', 'Suitable from birth'],
  ARRAY['Avocado oil', 'Aloe vera', 'Calendula extract'],
  'Massage over wet hair and body, rinse thoroughly.', 4.5, 284, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-hair-body-wash-500ml", "unit": "chai", "price": 178000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Avocado Oil'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-bath-body-wash', 'Bath & Body Wash', 'Soap-free body wash made with oatmeal and calendula to gently cleanse and protect delicate skin.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Bath Time',
  ARRAY['Soap-free', 'Calming oat formula', 'Suitable from birth', 'Australian made'],
  ARRAY['Colloidal oatmeal', 'Calendula extract', 'Aloe vera'],
  'Add to bath water or apply directly, massage gently, rinse.', 4.5, 160, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-bath-body-wash-500ml", "unit": "chai", "price": 178000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Oatmeal'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-hair-detangler', 'Hair Detangler', 'Leave-in conditioning mist that untangles fine baby hair gently, leaving it soft and manageable.', 154000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Hair Care',
  ARRAY['Easy detangling', 'Leave-in conditioning', 'Plant-based', 'Suitable from birth'],
  ARRAY['Aloe vera', 'Evening primrose oil', 'Vitamin E'],
  'Spray on damp hair, comb through gently. No rinsing required.', 4.3, 80, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-hair-detangler-200ml", "unit": "chai", "price": 154000, "title": "200ml", "quantity": 1, "pricePerUnit": "₫154,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Aloe Vera'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-sleeptime-bubble-bath', 'Sleeptime Bubble Bath', 'Gentle bubble bath with calming lavender to make bedtime fun and relaxing.', 155000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Bath Time',
  ARRAY['Fun bubble bath', 'Calming lavender scent', 'Plant-based', 'Suitable from birth'],
  ARRAY['Lavender oil', 'Calendula extract'],
  'Add a small amount to running bath water.', 4.7, 21, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-sleeptime-bubble-bath-500ml", "unit": "chai", "price": 155000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫155,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Lavender'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-2in1-shampoo-conditioner', '2-in-1 Shampoo & Conditioner', 'Gentle daily shampoo and conditioner for baby hair, from fine to curly. Leaves hair soft and tangle-free.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Hair Care',
  ARRAY['2-in-1 formula', 'For fine to curly hair', 'Plant-based', 'Suitable from birth'],
  ARRAY['Avocado oil', 'Aloe vera'],
  'Massage into wet hair, rinse thoroughly.', 5, 1, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-2in1-shampoo-500ml", "unit": "chai", "price": 178000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Avocado Oil'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
);

-- ============================================================
-- GAIA Skin Naturals — baby skin care
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'gaia-baby-moisturiser', 'Baby Moisturiser', 'Rich daily moisturiser with avocado oil and aloe vera to keep baby skin soft, hydrated and protected.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Skin Care',
  ARRAY['Daily hydration', 'Avocado oil + aloe vera', 'Suitable from birth', 'Plant-based'],
  ARRAY['Avocado oil', 'Aloe vera', 'Calendula extract'],
  'Apply a small amount to clean dry skin, massage gently.', 4.5, 240, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-baby-moisturiser-500ml", "unit": "chai", "price": 178000, "title": "500ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Avocado Oil'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-baby-powder', 'Baby Powder', 'Fine cornstarch-based powder that keeps skin dry and comfortable, gentle on sensitive skin.', 139000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Skin Care',
  ARRAY['Keeps skin dry', 'Cornstarch-based', 'Talc-free', 'Suitable from birth'],
  ARRAY['Corn starch', 'Calendula extract'],
  'Sprinkle lightly on dry skin, smooth gently.', 4.6, 103, TRUE, FALSE,
  ARRAY['Avoid inhalation', 'For external use only'],
  '[{"id": "gaia-baby-powder-200g", "unit": "chai", "price": 139000, "title": "200g", "quantity": 1, "pricePerUnit": "₫139,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Corn Starch'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-baby-massage-oil', 'Baby Massage Oil', 'Nourishing massage oil with a calming blend of botanical oils to soothe and relax baby before bed.', 178000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Skin Care',
  ARRAY['Relaxing massage ritual', 'Botanical oil blend', 'Suitable from birth', 'Plant-based'],
  ARRAY['Sunflower oil', 'Evening primrose oil', 'Calendula', 'Lavender'],
  'Warm a small amount in hands, massage gently onto skin.', 4.7, 161, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-baby-massage-oil-200ml", "unit": "chai", "price": 178000, "title": "200ml", "quantity": 1, "pricePerUnit": "₫178,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Evening Primrose Oil'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-eczema-cream', 'Eczema Cream', 'Intensive care cream to help soothe and protect eczema-prone skin. Developed with dermatologists.', 294000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Skin Care',
  ARRAY['Eczema-prone relief', 'Dermatologist developed', 'Gentle on sensitive skin', 'Plant-based'],
  ARRAY['Colloidal oatmeal', 'Calendula', 'Shea butter', 'Vitamin E'],
  'Apply a thin layer to affected areas as needed.', 5, 2, TRUE, FALSE,
  ARRAY['For external use only', 'Consult doctor if symptoms persist'],
  '[{"id": "gaia-eczema-cream-200ml", "unit": "chai", "price": 294000, "title": "200ml", "quantity": 1, "pricePerUnit": "₫294,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Oatmeal'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-cradle-cap-lotion', 'Cradle Cap Lotion', 'Softens and gently lifts cradle cap flakes while moisturising baby scalp.', 232000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Hair Care',
  ARRAY['Softens cradle cap', 'Moisturises scalp', 'Plant-based', 'Suitable from birth'],
  ARRAY['Safflower oil', 'Evening primrose oil', 'Vitamin E'],
  'Massage into scalp, leave for a few minutes, comb out flakes, rinse.', 5, 1, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-cradle-cap-lotion-100ml", "unit": "chai", "price": 232000, "title": "100ml", "quantity": 1, "pricePerUnit": "₫232,000 mỗi chai"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Evening Primrose Oil'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
);

-- ============================================================
-- GAIA Skin Naturals — oral care
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'gaia-toothpaste-berry', 'Natural Probiotic Toothpaste - Berry Burst', 'Fluoride-free probiotic toothpaste in a sweet berry flavour that little ones love. Gentle, safe to swallow in small amounts.', 108000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Oral Care',
  ARRAY['Fluoride-free', 'Probiotic formula', 'Safe to swallow in small amounts', 'No artificial sweeteners'],
  ARRAY['Probiotic blend', 'Calendula', 'Natural berry flavour'],
  'Apply a pea-sized amount, brush gently, supervise children.', 4.4, 113, TRUE, FALSE,
  ARRAY['Supervise children under 6', 'Not for swallowing in large amounts'],
  '[{"id": "gaia-toothpaste-berry-100g", "unit": "chai", "price": 108000, "title": "100g", "quantity": 1, "pricePerUnit": "₫108,000 mỗi chai"}]'::jsonb,
  ARRAY['Kids'], ARRAY['Probiotic'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-toothpaste-bubblegum', 'Natural Probiotic Toothpaste - Bubblegum', 'Fluoride-free probiotic toothpaste with a fun bubblegum taste for picky brushers.', 108000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Oral Care',
  ARRAY['Fluoride-free', 'Probiotic formula', 'Kid-friendly taste', 'No artificial sweeteners'],
  ARRAY['Probiotic blend', 'Calendula', 'Natural bubblegum flavour'],
  'Apply a pea-sized amount, brush gently, supervise children.', 4.4, 113, TRUE, FALSE,
  ARRAY['Supervise children under 6'],
  '[{"id": "gaia-toothpaste-bubblegum-100g", "unit": "chai", "price": 108000, "title": "100g", "quantity": 1, "pricePerUnit": "₫108,000 mỗi chai"}]'::jsonb,
  ARRAY['Kids'], ARRAY['Probiotic'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-toothpaste-mint', 'Natural Probiotic Toothpaste - Mild Mint', 'Gentle fluoride-free mint toothpaste for older kids who prefer a fresh taste.', 108000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Oral Care',
  ARRAY['Fluoride-free', 'Probiotic formula', 'Fresh mild mint', 'No artificial sweeteners'],
  ARRAY['Probiotic blend', 'Calendula', 'Natural mint flavour'],
  'Apply a pea-sized amount, brush gently, supervise children.', 4.4, 113, TRUE, FALSE,
  ARRAY['Supervise children under 6'],
  '[{"id": "gaia-toothpaste-mint-100g", "unit": "chai", "price": 108000, "title": "100g", "quantity": 1, "pricePerUnit": "₫108,000 mỗi chai"}]'::jsonb,
  ARRAY['Kids'], ARRAY['Probiotic'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-toothpaste-smoothie', 'Natural Probiotic Toothpaste - Fruit Smoothie', 'Fluoride-free probiotic toothpaste with a delicious fruit smoothie flavour.', 108000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Oral Care',
  ARRAY['Fluoride-free', 'Probiotic formula', 'Fruit smoothie taste', 'No artificial sweeteners'],
  ARRAY['Probiotic blend', 'Calendula', 'Natural fruit flavour'],
  'Apply a pea-sized amount, brush gently, supervise children.', 4.4, 113, TRUE, FALSE,
  ARRAY['Supervise children under 6'],
  '[{"id": "gaia-toothpaste-smoothie-100g", "unit": "chai", "price": 108000, "title": "100g", "quantity": 1, "pricePerUnit": "₫108,000 mỗi chai"}]'::jsonb,
  ARRAY['Kids'], ARRAY['Probiotic'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
);

-- ============================================================
-- GAIA Skin Naturals — change time
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'gaia-nappy-bags', 'Biodegradable Nappy Bags', 'Eco-friendly, compostable nappy bags that are kind to the planet and practical for busy parents.', 108000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Change Time',
  ARRAY['Biodegradable', 'Compostable', 'Eco-friendly', 'Australian owned'],
  ARRAY['Plant-based compostable materials'],
  'Use as needed for nappy disposal.', 3.5, 2, TRUE, FALSE,
  ARRAY['Store in a cool dry place'],
  '[{"id": "gaia-nappy-bags-120pk", "unit": "gói", "price": 108000, "title": "120 pack", "quantity": 1, "pricePerUnit": "₫108,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Plant-based'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-cotton-pads', 'Organic Cotton Cleansing Pads', 'Soft organic cotton pads for gentle cleansing and nappy changes.', 77000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Change Time',
  ARRAY['Organic cotton', 'Soft & gentle', 'For sensitive skin', 'Australian made'],
  ARRAY['100% organic cotton'],
  'Use with warm water for gentle cleansing.', 4.3, 45, TRUE, FALSE,
  ARRAY['For external use only'],
  '[{"id": "gaia-cotton-pads-60pk", "unit": "gói", "price": 77000, "title": "60 pack", "quantity": 1, "pricePerUnit": "₫77,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-water-wipes', 'Biodegradable Water Wipes', 'Thick, gentle wipes made with 99% water and plant-based fibres. Compostable and kind to baby skin.', 46000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Change Time',
  ARRAY['99% water', 'Biodegradable', 'Plant-based fibres', 'Fragrance-free'],
  ARRAY['99% purified water', 'Plant-based fibres'],
  'Use for gentle cleansing during changes.', 5, 1, TRUE, FALSE,
  ARRAY['For external use only', 'Seal after use'],
  '[{"id": "gaia-water-wipes-60pk", "unit": "gói", "price": 46000, "title": "60 pack", "quantity": 1, "pricePerUnit": "₫46,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Water'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
),
(
  'gaia-pure-water-wipes', '99.5% Pure Water Wipes', 'Ultra-gentle wipes with 99.5% pure water, perfect for newborns with sensitive skin.', 93000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Baby Change Time',
  ARRAY['99.5% pure water', 'Sensitive skin friendly', 'No added fragrance', 'Australian made'],
  ARRAY['99.5% purified water', 'Plant-based fibres'],
  'Use for gentle cleansing during changes.', 4.5, 30, TRUE, FALSE,
  ARRAY['For external use only', 'Seal after use'],
  '[{"id": "gaia-pure-water-wipes-80pk", "unit": "gói", "price": 93000, "title": "80 pack", "quantity": 1, "pricePerUnit": "₫93,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Water'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'GAIA Skin Naturals', 'gaia'
);

-- ============================================================
-- The Little Oak Company — goat milk formula
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'littleoak-infant-formula', 'Natural Goat Milk Infant Formula', 'Gentle infant formula for babies 0-6 months, made with fresh whole goat milk from New Zealand. First formula in the world certified 100% palm oil free.', 934000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Infant Formula',
  ARRAY['Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', 'No GMOs, soy or maltodextrin', 'Supports healthy growth 0-6 months'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals', 'No palm oil, no canola oil, no soy, no sucrose'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.', 4.8, 320, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-formula-400g", "unit": "hộp", "price": 934000, "title": "400g", "quantity": 1, "pricePerUnit": "₫934,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'The Little Oak Company', 'littleoak'
),
(
  'littleoak-follow-on-formula', 'Natural Goat Milk Follow-on Formula', 'Nourishing follow-on formula for babies 6-12 months, made with fresh whole goat milk. Certified palm oil free.', 934000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Infant Formula',
  ARRAY['Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', 'No GMOs, soy or maltodextrin', 'Supports growth 6-12 months'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.', 4.7, 210, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-follow-on-formula-400g", "unit": "hộp", "price": 934000, "title": "400g", "quantity": 1, "pricePerUnit": "₫934,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'The Little Oak Company', 'littleoak'
),
(
  'littleoak-toddler-milk', 'Natural Goat Milk Toddler Milk', 'Creamy toddler milk from 12 months, boosted with 16 essential vitamins and minerals. Made with fresh whole goat milk.', 934000, NULL,
  'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500',
  'Infant Formula',
  ARRAY['Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', '16 essential vitamins & minerals', 'Supports growing toddlers 12m+'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.', 4.8, 190, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-milk-400g", "unit": "hộp", "price": 934000, "title": "400g", "quantity": 1, "pricePerUnit": "₫934,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=500'], 'The Little Oak Company', 'littleoak'
);

-- ============================================================
-- CARHUB MIGRATION: 20260916000002_carehub_product_images.sql
-- ============================================================
-- CareHub: swap placeholder images for real GAIA / LittleOak product photos
-- Hotlinks directly to the brands' public Shopify CDNs (verified HTTP 200, no auth).
-- image = card image (width=500); images = gallery (card image + 2 extra angles where available).
--
-- Run in the Supabase SQL Editor (can be run standalone; the products already exist).

-- ============================================================
-- GAIA Skin Naturals — baby bath time
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_26Square_987318fa-9d12-4f2d-ba66-8ba0120c8278.jpg?v=1781226651&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_26Square_987318fa-9d12-4f2d-ba66-8ba0120c8278.jpg?v=1781226651&width=500',
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabySleeptimeBath500mL-1_8af59144-8e17-4f06-aff8-d80707b40b0a.png?v=1781226711&width=800',
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabySleeptimeBath250mL-1.png?v=1781226675&width=800'
    ]
WHERE id = 'gaia-sleeptime-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_29Square_8bcb4e09-4d9d-4a25-b30a-6e894924e5e5.jpg?v=1781226550&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_29Square_8bcb4e09-4d9d-4a25-b30a-6e894924e5e5.jpg?v=1781226550&width=500'
    ]
WHERE id = 'gaia-hair-body-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_23Square.jpg?v=1781226423&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_23Square.jpg?v=1781226423&width=500'
    ]
WHERE id = 'gaia-bath-body-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/products/DSC_6740.jpg?v=1652856777&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/products/DSC_6740.jpg?v=1652856777&width=500'
    ]
WHERE id = 'gaia-hair-detangler';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/111125_DSC_1636.jpg?v=1781226225&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/111125_DSC_1636.jpg?v=1781226225&width=500'
    ]
WHERE id = 'gaia-sleeptime-bubble-bath';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_4317.jpg?v=1713421973&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_4317.jpg?v=1713421973&width=500'
    ]
WHERE id = 'gaia-2in1-shampoo-conditioner';

-- ============================================================
-- GAIA Skin Naturals — baby skin care
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_20_Aug24Square.jpg?v=1745369031&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_20_Aug24Square.jpg?v=1745369031&width=500'
    ]
WHERE id = 'gaia-baby-moisturiser';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/custom_resized_ee1e2363-c36f-4600-8059-58c2dbc0cfb9.jpg?v=1687753567&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/custom_resized_ee1e2363-c36f-4600-8059-58c2dbc0cfb9.jpg?v=1687753567&width=500'
    ]
WHERE id = 'gaia-baby-powder';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_9633.jpg?v=1747804580&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_9633.jpg?v=1747804580&width=500'
    ]
WHERE id = 'gaia-baby-massage-oil';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/IMG_8799_Oct24Square.jpg?v=1733441643&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/IMG_8799_Oct24Square.jpg?v=1733441643&width=500'
    ]
WHERE id = 'gaia-eczema-cream';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabyCradleCapLotion75mL-9.jpg?v=1733443008&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabyCradleCapLotion75mL-9.jpg?v=1733443008&width=500'
    ]
WHERE id = 'gaia-cradle-cap-lotion';

-- ============================================================
-- GAIA Skin Naturals — oral care
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30091Square.jpg?v=1745370294&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30091Square.jpg?v=1745370294&width=500'
    ]
WHERE id = 'gaia-toothpaste-berry';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30005Square_b3071172-ef31-4753-8df9-4365ba8c849d.jpg?v=1745370062&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30005Square_b3071172-ef31-4753-8df9-4365ba8c849d.jpg?v=1745370062&width=500'
    ]
WHERE id = 'gaia-toothpaste-bubblegum';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30099Square.jpg?v=1745369671&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30099Square.jpg?v=1745369671&width=500'
    ]
WHERE id = 'gaia-toothpaste-mint';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30072Square.jpg?v=1745369391&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30072Square.jpg?v=1745369391&width=500'
    ]
WHERE id = 'gaia-toothpaste-smoothie';

-- ============================================================
-- GAIA Skin Naturals — change time
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_0097.jpg?v=1733873700&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_0097.jpg?v=1733873700&width=500'
    ]
WHERE id = 'gaia-nappy-bags';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/products/CottonPads.png?v=1615513088&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/products/CottonPads.png?v=1615513088&width=500'
    ]
WHERE id = 'gaia-cotton-pads';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_6521.jpg?v=1723422122&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_6521.jpg?v=1723422122&width=500'
    ]
WHERE id = 'gaia-water-wipes';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_1659.jpg?v=1748499842&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_1659.jpg?v=1748499842&width=500'
    ]
WHERE id = 'gaia-pure-water-wipes';

-- ============================================================
-- The Little Oak Company — goat milk formula
-- ============================================================
UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage_1_Front_-_purity_award.jpg?v=1774458198&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage_1_Front_-_purity_award.jpg?v=1774458198&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_1_907e78e4-e5f8-40ac-b416-6023e2c4b979.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-infant-formula';

UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-2-Front---purity-award_69814213-de40-4240-8797-0a39d541ee55.jpg?v=1774458336&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-2-Front---purity-award_69814213-de40-4240-8797-0a39d541ee55.jpg?v=1774458336&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_2_33f0cefb-2007-4d82-82c6-77a27c188625.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-follow-on-formula';

UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-3-Front-Purity.jpg?v=1774458226&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-3-Front-Purity.jpg?v=1774458226&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_3_06de040e-0daf-4ca1-9133-7601ab9adb22.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-toddler-milk';

-- ============================================================
-- CARHUB MIGRATION: 20260916000003_carehub_normalize_categories.sql
-- ============================================================
-- CareHub: normalize product category values so filters match exactly.
-- The DB has both "Women's Health" and "Women's health" for the same logical category.
-- Canonical value: "Women's Health" (matches the frontend category list).

UPDATE public.products
SET category = 'Women''s Health'
WHERE category = 'Women''s health';

-- Show the resulting distinct categories for confirmation
SELECT DISTINCT category FROM public.products ORDER BY category;

-- ============================================================
-- CARHUB MIGRATION: 20260916000004_carehub_blackmores_brand.sql
-- ============================================================
-- CareHub: correctly brand the original products as Blackmores
--
-- CareHub is the STORE. Blackmores / GAIA Skin Naturals / The Little Oak Company
-- are the PRODUCT BRANDS. The 18 original products were seeded before the
-- multi-brand columns existed and defaulted to brand = 'CareHub'; they are
-- actually Blackmores products.
--
-- Naming convention (Option A, consistent across all brands):
--   * product name  = clean product name ("Cranberry Forte 50,000")
--   * brand tag     = brand shown on the card / product page ("Blackmores")
--   * SKU titles    = sizes only ("90 capsules", "60 viên")
-- No name or SKU changes are needed.

UPDATE public.products
SET brand = 'Blackmores',
    brand_slug = 'blackmores'
WHERE brand = 'CareHub'
  AND brand_slug = 'carehub';

-- Verify: the 18 originals should now be branded Blackmores
SELECT id, name, brand, brand_slug
FROM public.products
WHERE brand_slug = 'blackmores'
ORDER BY id;

-- ============================================================
-- CARHUB MIGRATION: 20260916000005_carehub_gaia_health_goals.sql
-- ============================================================
-- CareHub: assign meaningful health-goal tags to GAIA products.
-- (Previously all GAIA products were tagged only 'General Health'.)
--
--   Sleep & Stress      -> lavender bedtime line
--   Nails, Hair & Skin  -> moisturising / hair / scalp care
--   General Health      -> oral care, change-time, and everyday wash (kept)

-- Sleep & Stress
UPDATE public.products
SET health_goals = ARRAY['Sleep & Stress', 'General Health']
WHERE id IN ('gaia-sleeptime-wash', 'gaia-sleeptime-bubble-bath', 'gaia-baby-massage-oil');

-- Nails, Hair & Skin
UPDATE public.products
SET health_goals = ARRAY['Nails, Hair & Skin', 'General Health']
WHERE id IN (
  'gaia-hair-body-wash',
  'gaia-bath-body-wash',
  'gaia-hair-detangler',
  'gaia-2in1-shampoo-conditioner',
  'gaia-baby-moisturiser',
  'gaia-baby-powder',
  'gaia-eczema-cream',
  'gaia-cradle-cap-lotion'
);

-- Everything else stays 'General Health' (toothpastes, nappy bags, wipes, cotton pads)
-- No update needed for those.

-- Verify
SELECT id, name, health_goals
FROM public.products
WHERE id LIKE 'gaia-%'
ORDER BY id;

-- ============================================================
-- CARHUB MIGRATION: 20260916000006_carehub_ship_readiness.sql
-- ============================================================
-- CareHub: ship-readiness fixes found by the full smoke test
--
-- Fixes 5 data issues:
--   1. Products 3 (Cranberry Forte) and 7 (Bio Iron) still had the Pexels
--      placeholder image -> replaced with real Blackmores product photos.
--   2. Products 3 and 7 still had the lowercase category "Women's health"
--      -> normalized to "Women's Health" (matches the frontend category list).
--   3. GAIA products all had health_goals = ['General Health'] only
--      -> tagged with meaningful goals so the health-goal filter works:
--         Sleep & Stress for the lavender bedtime line, Nails, Hair & Skin
--         for moisturising / hair / scalp care.

-- ============================================================
-- 1 + 2: Real images + normalized category for the 2 numeric-ID products
-- ============================================================
UPDATE public.products
SET image = 'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/bltdb5cee57ab297417/68bfba5d7d7baa76c68875ac/93573320-1.webp?branch=main',
    images = ARRAY[
      'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/bltdb5cee57ab297417/68bfba5d7d7baa76c68875ac/93573320-1.webp?branch=main',
      'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/blt7e04171c7d0ee092/68bfb6d58fc1af658b46e1eb/93573320-3png.webp?branch=main'
    ],
    category = 'Women''s Health'
WHERE id = '3';

UPDATE public.products
SET image = 'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/blt29cfb1eb4355bb35/68bfc0ca7d7baa1c39887658/93556828-1.webp?branch=main',
    images = ARRAY[
      'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/blt29cfb1eb4355bb35/68bfc0ca7d7baa1c39887658/93556828-1.webp?branch=main',
      'https://images.contentstack.io/v3/assets/blt948bd74310fc0ad0/bltf925c9c9e1696514/68bfb55c945ba400de5e8bd4/93556828-3.webp?branch=main'
    ],
    category = 'Women''s Health'
WHERE id = '7';

-- ============================================================
-- 3: Meaningful GAIA health-goal tags
-- ============================================================
-- Sleep & Stress (lavender bedtime line)
UPDATE public.products
SET health_goals = ARRAY['Sleep & Stress', 'General Health']
WHERE id IN ('gaia-sleeptime-wash', 'gaia-sleeptime-bubble-bath', 'gaia-baby-massage-oil');

-- Nails, Hair & Skin (moisturising / hair / scalp care)
UPDATE public.products
SET health_goals = ARRAY['Nails, Hair & Skin', 'General Health']
WHERE id IN (
  'gaia-hair-body-wash',
  'gaia-bath-body-wash',
  'gaia-hair-detangler',
  'gaia-2in1-shampoo-conditioner',
  'gaia-baby-moisturiser',
  'gaia-baby-powder',
  'gaia-eczema-cream',
  'gaia-cradle-cap-lotion'
);

-- ============================================================
-- Verify
-- ============================================================
SELECT id, name, category, image LIKE '%pexels%' AS is_placeholder
FROM public.products
WHERE id IN ('3', '7');

SELECT id, health_goals
FROM public.products
WHERE id LIKE 'gaia-%'
ORDER BY id;

-- ============================================================
-- CARHUB MIGRATION: 20260916000007_carehub_littleoak_prices.sql
-- ============================================================
-- CareHub: update LittleOak product prices
--
--   Natural Goat Milk Infant Formula  934,000 -> 1,200,000
--   Natural Goat Milk Follow-on Formula 934,000 -> 1,200,000
--   Natural Goat Milk Toddler Milk    934,000 -> 1,180,000
--
-- Updates both the top-level price column and the matching SKU (price +
-- pricePerUnit display string) so every surface shows the same price.

-- Infant Formula
UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-infant-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-infant-formula';

-- Follow-on Formula
UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-follow-on-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-follow-on-formula';

-- Toddler Milk
UPDATE public.products
SET price = 1180000,
    skus = '[{"id": "littleoak-toddler-milk-400g", "unit": "hộp", "price": 1180000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,180,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-toddler-milk';

-- Verify
SELECT id, name, price, skus
FROM public.products
WHERE id IN ('littleoak-infant-formula', 'littleoak-follow-on-formula', 'littleoak-toddler-milk')
ORDER BY id;

-- ============================================================
-- CARHUB MIGRATION: 20260916000008_carehub_littleoak_full_catalog.sql
-- ============================================================
-- CareHub: add the 9 missing LittleOak SG products
--
-- LittleOak SG catalog (12 total): 3 formula cans (already in store),
-- 3 travel sachet packs (6x30g), 6 accessories.
--
-- Pricing: the user set the tin (S$65.95) at 1,200,000 VND, so
-- VND/SGD = 1,200,000 / 65.95 = 18,195.5. Rounded to clean VND values:
--   S$18.95  sachet pack  -> 344,800  (round 345,000)
--   S$7.95   burp cloth   -> 144,600  (round 145,000)
--   S$9.99   calico bag   -> 181,700  (round 182,000)
--   S$10.95  bib          -> 199,200  (round 199,000)
--   S$19.95  towel pink   -> 363,000
--   S$19.95  towel green  -> 363,000
--   S$22.95  towel yellow -> 417,600  (round 418,000)
--
-- Product IDs are descriptive slugs. Images hotlink to LittleOak's public
-- Shopify CDN (verified HTTP 200).

-- ============================================================
-- Travel sachet packs (6 x 30g)
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'littleoak-infant-sachets',
  'Natural Goat Milk Infant Formula 6 x 30g Travel Sachets',
  'Portable travel sachets of LittleOak natural goat milk infant formula with olive oil (Stage 1, 0-6 months). Perfect for outings, travel and feeding on the go — same From Fresh formula, pre-measured 30g sachets.',
  345000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO-Stage-1-Front_Olive-Oil_4_1.jpg?v=1776866521&width=500',
  'Infant Formula',
  ARRAY['Travel-ready 30g sachets', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', 'No GMOs, soy or maltodextrin'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 45, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-sachets-6x30g", "unit": "gói", "price": 345000, "title": "6 x 30g", "quantity": 6, "pricePerUnit": "₫345,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO-Stage-1-Front_Olive-Oil_4_1.jpg?v=1776866521&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-follow-on-sachets',
  'Natural Goat Milk Follow-on Formula 6 x 30g Travel Sachets',
  'Portable travel sachets of LittleOak natural goat milk follow-on formula with olive oil (Stage 2, 6-12 months). Pre-measured 30g sachets for feeding on the go.',
  345000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO_Stage2-SachetBox-Front_300dpi_1_5684daa7-c51c-4ce4-91cb-a2d8b060788d.png?v=1776867851&width=500',
  'Infant Formula',
  ARRAY['Travel-ready 30g sachets', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', 'No GMOs, soy or maltodextrin'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 32, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-follow-on-sachets-6x30g", "unit": "gói", "price": 345000, "title": "6 x 30g", "quantity": 6, "pricePerUnit": "₫345,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO_Stage2-SachetBox-Front_300dpi_1_5684daa7-c51c-4ce4-91cb-a2d8b060788d.png?v=1776867851&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-toddler-sachets',
  'Natural Goat Milk Toddler Milk 6 x 30g Travel Sachets',
  'Portable travel sachets of LittleOak natural goat milk toddler milk with olive oil (Stage 3, 12m+). Pre-measured 30g sachets for toddlers on the go.',
  345000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO-Stage-3-Front_Olive-Oil_6_1.png?v=1776868118&width=500',
  'Infant Formula',
  ARRAY['Travel-ready 30g sachets', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)', 'Supports growing toddlers 12m+'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 28, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-sachets-6x30g", "unit": "gói", "price": 345000, "title": "6 x 30g", "quantity": 6, "pricePerUnit": "₫345,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LO-Stage-3-Front_Olive-Oil_6_1.png?v=1776868118&width=500'],
  'The Little Oak Company', 'littleoak'
);

-- ============================================================
-- Accessories
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
(
  'littleoak-burp-cloth',
  'Premium Natural Cotton Burp Cloth',
  'Soft, absorbent 100% natural cotton burp cloth — gentle on baby skin and machine washable. A daily essential for feeding time.',
  145000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Cloth-1.png?v=1766115106&width=500',
  'Baby Change Time',
  ARRAY['100% natural cotton', 'Soft & absorbent', 'Machine washable', 'Gentle on baby skin'],
  ARRAY['100% cotton'],
  'Use as needed during and after feeding.', 4.6, 120, TRUE, FALSE,
  ARRAY['Machine wash before first use'],
  '[{"id": "littleoak-burp-cloth", "unit": "gói", "price": 145000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫145,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Cloth-1.png?v=1766115106&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-calico-bag',
  'LittleOak Calico Bag',
  'Reusable natural calico tote bag — a handy eco-friendly carry-all for nappies, wipes and baby essentials.',
  182000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LittleOak_040.jpg?v=1770079561&width=500',
  'Baby Change Time',
  ARRAY['Reusable & eco-friendly', 'Natural calico fabric', 'Spacious tote', 'Machine washable'],
  ARRAY['100% natural calico'],
  'Use as an everyday carry bag.', 4.5, 60, TRUE, FALSE,
  ARRAY['Hand wash recommended'],
  '[{"id": "littleoak-calico-bag", "unit": "gói", "price": 182000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫182,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LittleOak_040.jpg?v=1770079561&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-bandana-bib',
  'LittleOak Organic Cotton Bandana Bib',
  'Stylish organic cotton bandana bib that keeps baby dry and cute — soft, absorbent, and gentle on sensitive skin.',
  199000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LittleOak_007_1.jpg?v=1770079531&width=500',
  'Baby Change Time',
  ARRAY['100% organic cotton', 'Soft & absorbent', 'Stylish bandana design', 'Gentle on sensitive skin'],
  ARRAY['100% organic cotton'],
  'Use during feeding and teething.', 4.7, 85, TRUE, FALSE,
  ARRAY['Machine wash before first use'],
  '[{"id": "littleoak-bandana-bib", "unit": "gói", "price": 199000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫199,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/LittleOak_007_1.jpg?v=1770079531&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-towel-pink',
  'LittleOak Cotton Towel - Powder Pink',
  'Hooded 100% cotton baby towel in soft powder pink — thick, absorbent and perfect after bath time.',
  363000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_071.jpg?v=1754967222&width=500',
  'Baby Change Time',
  ARRAY['100% cotton hooded towel', 'Soft & absorbent', 'After-bath essential', 'Machine washable'],
  ARRAY['100% cotton'],
  'Wrap baby gently after bathing.', 4.8, 150, TRUE, FALSE,
  ARRAY['Machine wash before first use'],
  '[{"id": "littleoak-towel-pink", "unit": "gói", "price": 363000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫363,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_071.jpg?v=1754967222&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-towel-green',
  'LittleOak Cotton Towel - French Green',
  'Hooded 100% cotton baby towel in French green — thick, absorbent and perfect after bath time.',
  363000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_034.jpg?v=1754967349&width=500',
  'Baby Change Time',
  ARRAY['100% cotton hooded towel', 'Soft & absorbent', 'After-bath essential', 'Machine washable'],
  ARRAY['100% cotton'],
  'Wrap baby gently after bathing.', 4.8, 140, TRUE, FALSE,
  ARRAY['Machine wash before first use'],
  '[{"id": "littleoak-towel-green", "unit": "gói", "price": 363000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫363,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_034.jpg?v=1754967349&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-towel-yellow',
  'LittleOak Cotton Towel - Butter Cream Yellow',
  'Hooded 100% cotton baby towel in buttery yellow — thick, absorbent and perfect after bath time.',
  418000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_023.jpg?v=1754967148&width=500',
  'Baby Change Time',
  ARRAY['100% cotton hooded towel', 'Soft & absorbent', 'After-bath essential', 'Machine washable'],
  ARRAY['100% cotton'],
  'Wrap baby gently after bathing.', 4.8, 130, TRUE, FALSE,
  ARRAY['Machine wash before first use'],
  '[{"id": "littleoak-towel-yellow", "unit": "gói", "price": 418000, "title": "1 pc", "quantity": 1, "pricePerUnit": "₫418,000 mỗi gói"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Cotton'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Little-Oak_023.jpg?v=1754967148&width=500'],
  'The Little Oak Company', 'littleoak'
);

-- ============================================================
-- Verify: all 12 LittleOak products
-- ============================================================
SELECT id, name, price, category
FROM public.products
WHERE brand_slug = 'littleoak'
ORDER BY id;

-- ============================================================
-- CARHUB MIGRATION: 20260916000009_carehub_littleoak_combos.sql
-- ============================================================
-- CareHub: LittleOak catalog correction — remove accessories, add combo bundles
--
-- Per the business decision: sell only infant formula products.
--   1. REMOVE the 6 accessories (towels x3, bib, calico bag, burp cloth)
--   2. KEEP the 3 formula cans (prices updated to 1,200,000 / 1,200,000 / 1,180,000)
--   3. KEEP the 3 travel sachet packs at 345,000
--   4. ADD 12 combo bundles (4 bundle types x 3 stages)
--
-- Combo pricing: (sum of contents at list price) x 95%
--   tin = 1,200,000   sachet box (6x30g) = 345,000
--   6 x Can Bundle       6 tins                    -> 6 x 1,200,000 x 0.95   = 6,840,000
--   One & One Bundle     1 tin + 1 sachet box      -> (1,200,000+345,000)x.95 = 1,476,750
--   Family Saver Bundle  4 tins + 4 sachet boxes   -> (4x1,200,000+4x345,000)x.95 = 5,871,000
--   Easy Everyday Bundle 6 sachet boxes            -> 6 x 345,000 x 0.95      = 1,966,500

-- ============================================================
-- 1. Remove accessories
-- ============================================================
DELETE FROM public.products
WHERE id IN (
  'littleoak-towel-pink',
  'littleoak-towel-green',
  'littleoak-towel-yellow',
  'littleoak-bandana-bib',
  'littleoak-calico-bag',
  'littleoak-burp-cloth'
);

-- ============================================================
-- 2. Update the 3 formula cans to the agreed prices
-- ============================================================
UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-infant-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-infant-formula';

UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-follow-on-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-follow-on-formula';

UPDATE public.products
SET price = 1180000,
    skus = '[{"id": "littleoak-toddler-milk-400g", "unit": "hộp", "price": 1180000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,180,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-toddler-milk';

-- ============================================================
-- 3. Insert 12 combo bundles (4 types x 3 stages)
-- ============================================================
INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
-- Stage 1: Infant Formula combos
(
  'littleoak-infant-6can-bundle',
  '6 x Can Bundle - Natural Goat Milk Infant Formula with Olive Oil',
  'Six cans of LittleOak natural goat milk infant formula with olive oil (Stage 1, 0-6 months). Save 5% versus buying singles.',
  6840000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-6-can-bundle_9ad2298b-1689-4376-81d4-3e9e59aaba76.webp?v=1778813018&width=500',
  'Infant Formula',
  ARRAY['6 x 400g cans', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 30, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-6can-bundle", "unit": "hộp", "price": 6840000, "title": "6 x 400g cans", "quantity": 6, "pricePerUnit": "₫1,140,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-6-can-bundle_9ad2298b-1689-4376-81d4-3e9e59aaba76.webp?v=1778813018&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-infant-one1-bundle',
  'One & One Bundle - Natural Goat Milk Infant Formula with Olive Oil',
  'One can of LittleOak infant formula plus one box of 6 x 30g travel sachets (Stage 1, 0-6 months). Save 5% versus buying separately.',
  1476750, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-one-by-one_73c4b29a-c89a-4571-bdda-c0d25bddc383.webp?v=1778813621&width=500',
  'Infant Formula',
  ARRAY['1 x 400g can + 6 x 30g sachets', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 18, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-one1-bundle", "unit": "gói", "price": 1476750, "title": "1 x 400g can + 6 x 30g sachets", "quantity": 1, "pricePerUnit": "₫1,476,750 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-one-by-one_73c4b29a-c89a-4571-bdda-c0d25bddc383.webp?v=1778813621&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-infant-family-saver',
  'Family Saver Bundle - Natural Goat Milk Infant Formula with Olive Oil',
  'Four cans of LittleOak infant formula plus four boxes of 6 x 30g travel sachets (Stage 1, 0-6 months). Best value for families. Save 5%.',
  5871000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-family-saver_39ec6a15-9c45-40e1-9297-4ff929f94920.webp?v=1778813637&width=500',
  'Infant Formula',
  ARRAY['4 x 400g cans + 4 x 6x30g sachet boxes', 'Best value for families', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 12, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-family-saver", "unit": "gói", "price": 5871000, "title": "4 x 400g cans + 4 x 6x30g sachet boxes", "quantity": 1, "pricePerUnit": "₫5,871,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-1-family-saver_39ec6a15-9c45-40e1-9297-4ff929f94920.webp?v=1778813637&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-infant-easy-everyday',
  'Easy Everyday Sachet Bundle - Natural Goat Milk Infant Formula with Olive Oil',
  'Six boxes of LittleOak infant formula travel sachets (6 x 30g each, 36 sachets total). Convenient everyday feeding. Save 5%.',
  1966500, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-infant.webp?v=1752210365&width=500',
  'Infant Formula',
  ARRAY['6 x 6x30g sachet boxes (36 sachets)', 'Convenient everyday feeding', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 20, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "littleoak-infant-easy-everyday", "unit": "gói", "price": 1966500, "title": "6 x 6x30g sachet boxes (36 sachets)", "quantity": 36, "pricePerUnit": "₫1,966,500 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-infant.webp?v=1752210365&width=500'],
  'The Little Oak Company', 'littleoak'
),
-- Stage 2: Follow-on Formula combos
(
  'littleoak-followon-6can-bundle',
  '6 x Can Bundle - Natural Goat Milk Follow-on Formula with Olive Oil',
  'Six cans of LittleOak natural goat milk follow-on formula with olive oil (Stage 2, 6-12 months). Save 5% versus buying singles.',
  6840000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-6-can-bundle_7f537893-ddc2-4719-a69b-e0867ce20ef4.webp?v=1778813687&width=500',
  'Infant Formula',
  ARRAY['6 x 400g cans', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 25, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-followon-6can-bundle", "unit": "hộp", "price": 6840000, "title": "6 x 400g cans", "quantity": 6, "pricePerUnit": "₫1,140,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-6-can-bundle_7f537893-ddc2-4719-a69b-e0867ce20ef4.webp?v=1778813687&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-followon-one1-bundle',
  'One & One Bundle - Natural Goat Milk Follow-on Formula with Olive Oil',
  'One can of LittleOak follow-on formula plus one box of 6 x 30g travel sachets (Stage 2, 6-12 months). Save 5% versus buying separately.',
  1476750, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-one-by-one_d4b59429-83aa-4d91-a25f-16bfa7000c7f.webp?v=1778813737&width=500',
  'Infant Formula',
  ARRAY['1 x 400g can + 6 x 30g sachets', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 14, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-followon-one1-bundle", "unit": "gói", "price": 1476750, "title": "1 x 400g can + 6 x 30g sachets", "quantity": 1, "pricePerUnit": "₫1,476,750 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-one-by-one_d4b59429-83aa-4d91-a25f-16bfa7000c7f.webp?v=1778813737&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-followon-family-saver',
  'Family Saver Bundle - Natural Goat Milk Follow-on Formula with Olive Oil',
  'Four cans of LittleOak follow-on formula plus four boxes of 6 x 30g travel sachets (Stage 2, 6-12 months). Best value for families. Save 5%.',
  5871000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-family-saver_8141004c-fc8f-44b9-b5cf-31d38e1ec82c.webp?v=1778813694&width=500',
  'Infant Formula',
  ARRAY['4 x 400g cans + 4 x 6x30g sachet boxes', 'Best value for families', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 10, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-followon-family-saver", "unit": "gói", "price": 5871000, "title": "4 x 400g cans + 4 x 6x30g sachet boxes", "quantity": 1, "pricePerUnit": "₫5,871,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-2-family-saver_8141004c-fc8f-44b9-b5cf-31d38e1ec82c.webp?v=1778813694&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-followon-easy-everyday',
  'Easy Everyday Sachet Bundle - Natural Goat Milk Follow-on Formula with Olive Oil',
  'Six boxes of LittleOak follow-on formula travel sachets (6 x 30g each, 36 sachets total). Convenient everyday feeding. Save 5%.',
  1966500, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-follow-on.webp?v=1752210372&width=500',
  'Infant Formula',
  ARRAY['6 x 6x30g sachet boxes (36 sachets)', 'Convenient everyday feeding', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 16, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-followon-easy-everyday", "unit": "gói", "price": 1966500, "title": "6 x 6x30g sachet boxes (36 sachets)", "quantity": 36, "pricePerUnit": "₫1,966,500 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-follow-on.webp?v=1752210372&width=500'],
  'The Little Oak Company', 'littleoak'
),
-- Stage 3: Toddler Milk combos
(
  'littleoak-toddler-6can-bundle',
  '6 x Can Bundle - Natural Goat Milk Toddler Milk with Olive Oil',
  'Six cans of LittleOak natural goat milk toddler milk with olive oil (Stage 3, 12m+). Save 5% versus buying singles.',
  6726000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-6-can-bundle_5ea24ac5-e79b-4ed5-8948-2f57083dd43c.webp?v=1778813769&width=500',
  'Infant Formula',
  ARRAY['6 x 400g cans', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 22, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-6can-bundle", "unit": "hộp", "price": 6726000, "title": "6 x 400g cans", "quantity": 6, "pricePerUnit": "₫1,121,000 mỗi hộp"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-6-can-bundle_5ea24ac5-e79b-4ed5-8948-2f57083dd43c.webp?v=1778813769&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-toddler-one1-bundle',
  'One & One Bundle - Natural Goat Milk Toddler Milk with Olive Oil',
  'One can of LittleOak toddler milk plus one box of 6 x 30g travel sachets (Stage 3, 12m+). Save 5% versus buying separately.',
  1452750, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-one-by-one_bc781a52-8466-4479-a95f-1c6eda80db1e.webp?v=1778813790&width=500',
  'Infant Formula',
  ARRAY['1 x 400g can + 6 x 30g sachets', 'Save 5% on the bundle', 'Made from fresh whole goat milk', '100% palm oil free (POFCAP certified)'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 11, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-one1-bundle", "unit": "gói", "price": 1452750, "title": "1 x 400g can + 6 x 30g sachets", "quantity": 1, "pricePerUnit": "₫1,452,750 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-one-by-one_bc781a52-8466-4479-a95f-1c6eda80db1e.webp?v=1778813790&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-toddler-family-saver',
  'Family Saver Bundle - Natural Goat Milk Toddler Milk with Olive Oil',
  'Four cans of LittleOak toddler milk plus four boxes of 6 x 30g travel sachets (Stage 3, 12m+). Best value for families. Save 5%.',
  5809000, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-family-saver_374e0d32-dc57-4ab5-a19f-d123fc03b412.webp?v=1778813860&width=500',
  'Infant Formula',
  ARRAY['4 x 400g cans + 4 x 6x30g sachet boxes', 'Best value for families', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 8, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-family-saver", "unit": "gói", "price": 5809000, "title": "4 x 400g cans + 4 x 6x30g sachet boxes", "quantity": 1, "pricePerUnit": "₫5,809,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/Stage-3-family-saver_374e0d32-dc57-4ab5-a19f-d123fc03b412.webp?v=1778813860&width=500'],
  'The Little Oak Company', 'littleoak'
),
(
  'littleoak-toddler-easy-everyday',
  'Easy Everyday Sachet Bundle - Natural Goat Milk Toddler Milk with Olive Oil',
  'Six boxes of LittleOak toddler milk travel sachets (6 x 30g each, 36 sachets total). Convenient everyday feeding. Save 5%.',
  1966500, NULL,
  'https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-toddler.webp?v=1752210356&width=500',
  'Infant Formula',
  ARRAY['6 x 6x30g sachet boxes (36 sachets)', 'Convenient everyday feeding', 'Save 5% on the bundle', 'Made from fresh whole goat milk'],
  ARRAY['Fresh whole goat milk', 'Olive oil', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 13, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "littleoak-toddler-easy-everyday", "unit": "gói", "price": 1966500, "title": "6 x 6x30g sachet boxes (36 sachets)", "quantity": 36, "pricePerUnit": "₫1,966,500 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Goat Milk'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0793/4220/7288/files/easy-everyday-toddler.webp?v=1752210356&width=500'],
  'The Little Oak Company', 'littleoak'
);

-- ============================================================
-- Verify: all LittleOak products (should be 18: 3 cans + 3 sachets + 12 combos)
-- ============================================================
SELECT id, name, price, category
FROM public.products
WHERE brand_slug = 'littleoak'
ORDER BY id;
