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
