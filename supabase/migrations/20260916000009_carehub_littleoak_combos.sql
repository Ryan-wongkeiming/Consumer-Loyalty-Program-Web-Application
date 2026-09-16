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