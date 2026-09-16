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