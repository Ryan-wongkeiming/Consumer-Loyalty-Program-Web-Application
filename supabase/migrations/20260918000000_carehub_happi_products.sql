-- CareHub: add HAPPI Health products (10 SKUs)
--
-- Happi Health (https://happihealth.com.au) — Australian brand. 6x600g formula
-- packs (Day/Night x Stage 1/2/3) + 4 lactoferrin supplements.
--
-- Pricing: A$1 = 17,000 VND (user-confirmed conversion)
--   A$59.99 formula pack  -> 1,019,830  -> round 1,020,000
--   A$52.99 Adult Immune+ -> 900,830    -> round 900,000
--   A$44.99 Women's Iron+ / Baby Lactoferrin -> 764,830 -> round 765,000
--   A$29.99 Kids Immune+  -> 509,830    -> round 510,000
--
-- Images hotlink to Happi's public Shopify CDN (all 10 verified HTTP 200).
-- Category follows Happi's own taxonomy: Infant Formula / Adult Vitamins /
-- Kids Vitamins / Baby Vitamins.

INSERT INTO public.products (
  id, name, description, price, original_price, image, category,
  benefits, ingredients, dosage, rating, reviews, in_stock, is_subscription,
  warnings, skus, gender_age_categories, product_ingredients, health_goals, images,
  brand, brand_slug
) VALUES
-- ============================================================
-- Infant formulas (6 x 600g packs)
-- ============================================================
(
  'happi-day-infant-formula-stage-1',
  'Stage 1 Day Infant Formula 6 x 600g',
  'HAPPi Stage 1 Day is a nutritionally complete infant formula scientifically developed for day-time use between 5am–5pm. Day-specific nutrient blend to support daily energy needs.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S1_D.png?v=1739337805&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for day-time (5am-5pm)', 'Day-specific nucleotides and iron', 'Nutritionally complete infant formula', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Nucleotides', 'Iron', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 45, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "happi-day-infant-formula-stage-1-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S1_D.png?v=1739337805&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-night-infant-formula-stage-1',
  'Stage 1 Night Infant Formula 6 x 600g',
  'HAPPi Stage 1 Night is a nutritionally complete infant formula scientifically developed for night-time use between 5pm–5am. Richer in night-related nutrients to support brain and body development during sleep.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S1_N.png?v=1739337772&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for night-time (5pm-5am)', 'Richer in night-related nutrients', 'Supports brain & body development during sleep', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Night-specific nucleotides', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 38, TRUE, TRUE,
  ARRAY['Not suitable as sole source for babies under 6 months without medical advice', 'Follow preparation instructions exactly'],
  '[{"id": "happi-night-infant-formula-stage-1-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S1_N.png?v=1739337772&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-day-follow-on-formula-stage-2',
  'Stage 2 Day Follow On Formula 6 x 600g',
  'HAPPi Stage 2 Day is a nutritionally complete follow-on formula scientifically developed for day-time use between 5am–5pm for babies 6-12 months. Day-specific nutrient blend to support daily energy needs.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S2_D.png?v=1739337859&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for day-time (5am-5pm)', 'Day-specific nucleotides and iron', 'Nutritionally complete follow-on formula', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Nucleotides', 'Iron', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 32, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "happi-day-follow-on-formula-stage-2-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S2_D.png?v=1739337859&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-night-follow-on-formula-stage-2',
  'Stage 2 Night Follow On Formula 6 x 600g',
  'HAPPi Stage 2 Night is a nutritionally complete follow-on formula scientifically developed for night-time use between 5pm–5am for babies 6-12 months. Richer in night-related nutrients to support brain and body development during sleep.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S2_N.png?v=1739337827&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for night-time (5pm-5am)', 'Richer in night-related nutrients', 'Supports brain & body development during sleep', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Night-specific nucleotides', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.7, 28, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "happi-night-follow-on-formula-stage-2-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S2_N.png?v=1739337827&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-day-toddler-milk-stage-3',
  'Stage 3 Day Toddler Milk Drink 6 x 600g',
  'HAPPi Stage 3 Day is a nutritionally complete growing-up milk drink scientifically developed for day-time use between 5am–5pm for toddlers 12m+. Day-specific nutrient blend to support daily energy needs.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S3_D.png?v=1739336605&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for day-time (5am-5pm)', 'Supports daily energy needs', 'Nutritionally complete growing-up milk', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Nucleotides', 'Iron', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 30, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "happi-day-toddler-milk-stage-3-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S3_D.png?v=1739336605&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-night-toddler-milk-stage-3',
  'Stage 3 Night Toddler Milk Drink 6 x 600g',
  'HAPPi Stage 3 Night is a nutritionally complete growing-up milk drink scientifically developed for night-time use between 5pm–5am for toddlers 12m+. Richer in night-related nutrients to support brain and body development during sleep.',
  1020000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S3_D_6PK_2.png?v=1739337741&width=500',
  'Infant Formula',
  ARRAY['Scientifically developed for night-time (5pm-5am)', 'Richer in night-related nutrients', 'Supports brain & body development during sleep', 'Australian made'],
  ARRAY['Skim milk', 'Lactoferrin', 'Night-specific nucleotides', '16 essential vitamins & minerals'],
  'Prepare per feeding instructions. Use boiled cooled water, add powder, shake well.',
  4.8, 26, TRUE, TRUE,
  ARRAY['Follow preparation instructions exactly'],
  '[{"id": "happi-night-toddler-milk-stage-3-6x600g", "unit": "gói", "price": 1020000, "title": "6 x 600g", "quantity": 6, "pricePerUnit": "₫1,020,000 mỗi gói"}]'::jsonb,
  ARRAY['Infant Formula'], ARRAY['Lactoferrin'], ARRAY['General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/S3_D_6PK_2.png?v=1739337741&width=500'],
  'HAPPI Health', 'happi'
),
-- ============================================================
-- Lactoferrin supplements
-- ============================================================
(
  'happi-adult-daily-immune',
  'HAPPI Adult Daily Immune+ Lactoferrin',
  'Daily immune support with lactoferrin — an iron-binding protein found in milk and a natural component of the immune system. Supports the body''s natural defence against infection.',
  900000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Adult_rgb_resized.png?v=1697252091&width=500',
  'Vitamins',
  ARRAY['Supports immune system function', 'Lactoferrin - natural immune component', 'Daily defence against infection', 'Australian made'],
  ARRAY['Lactoferrin', 'Zinc', 'Vitamin C', 'Vitamin D'],
  'Take as directed on the label.', 4.6, 210, TRUE, FALSE,
  ARRAY['Always read the label', 'Follow directions for use'],
  '[{"id": "happi-adult-daily-immune", "unit": "hộp", "price": 900000, "title": "1 box", "quantity": 1, "pricePerUnit": "₫900,000 mỗi hộp"}]'::jsonb,
  ARRAY['Adult'], ARRAY['Lactoferrin'], ARRAY['General Health', 'Cold, Flu & Immunity'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Adult_rgb_resized.png?v=1697252091&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-womens-daily-iron',
  'HAPPI Women''s Daily Iron+ Lactoferrin',
  'Targeted relief from tiredness with less risk of gut irritation. Specially formulated for women across all stages of life to help prevent dietary iron deficiency and associated tiredness.',
  765000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Womens_rgb_resized.png?v=1697252244&width=500',
  'Vitamins',
  ARRAY['Targeted relief from tiredness', 'Less risk of gut irritation', 'Iron + lactoferrin advanced formula', 'For women at all life stages'],
  ARRAY['Iron', 'Lactoferrin', 'Vitamin C', 'Folate'],
  'Take as directed on the label.', 4.7, 180, TRUE, FALSE,
  ARRAY['Always read the label', 'Keep out of reach of children'],
  '[{"id": "happi-womens-daily-iron", "unit": "hộp", "price": 765000, "title": "1 box", "quantity": 1, "pricePerUnit": "₫765,000 mỗi hộp"}]'::jsonb,
  ARRAY['Women''s'], ARRAY['Iron', 'Lactoferrin'], ARRAY['Energy', 'General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Womens_rgb_resized.png?v=1697252244&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-kids-daily-immune',
  'HAPPI Kids Daily Immune+ Lactoferrin',
  'Specifically formulated for growing kids 3+ with the nutrients zinc and lactoferrin to support the health and function of the immune system.',
  510000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Kids_hr.png?v=1697251938&width=500',
  'Kids Supplements',
  ARRAY['Formulated for kids 3+', 'Zinc + lactoferrin', 'Supports immune system health', 'Australian made'],
  ARRAY['Lactoferrin', 'Zinc', 'Vitamin C', 'Vitamin D'],
  'Take as directed on the label.', 4.6, 140, TRUE, FALSE,
  ARRAY['Always read the label', 'Not for children under 3'],
  '[{"id": "happi-kids-daily-immune", "unit": "hộp", "price": 510000, "title": "1 box", "quantity": 1, "pricePerUnit": "₫510,000 mỗi hộp"}]'::jsonb,
  ARRAY['Kids'], ARRAY['Lactoferrin', 'Zinc'], ARRAY['Cold, Flu & Immunity', 'General Health'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/Happi_Kids_hr.png?v=1697251938&width=500'],
  'HAPPI Health', 'happi'
),
(
  'happi-baby-lactoferrin-powder',
  'HAPPI Baby Lactoferrin Powder',
  'Lactoferrin is a dietary protein found in cow''s milk and every drop of breast milk. Baby Lactoferrin Powder supports immune health for babies and young children.',
  765000, NULL,
  'https://cdn.shopify.com/s/files/1/0632/9054/0221/files/HAPPi_Baby_FOP800x800-768x768.png?v=1718877895&width=500',
  'Baby Supplements',
  ARRAY['Lactoferrin for baby immune support', 'Dietary protein found in breast milk', '28 x 1g sachets', 'Australian made'],
  ARRAY['Lactoferrin', 'Vitamin C', 'Zinc'],
  'Mix sachet contents with milk or food as directed on the label.', 4.7, 95, TRUE, FALSE,
  ARRAY['Always read the label', 'Not a replacement for breast milk'],
  '[{"id": "happi-baby-lactoferrin-powder-28x1g", "unit": "hộp", "price": 765000, "title": "28 x 1g sachets", "quantity": 28, "pricePerUnit": "₫765,000 mỗi hộp"}]'::jsonb,
  ARRAY['Babies'], ARRAY['Lactoferrin'], ARRAY['General Health', 'Cold, Flu & Immunity'],
  ARRAY['https://cdn.shopify.com/s/files/1/0632/9054/0221/files/HAPPi_Baby_FOP800x800-768x768.png?v=1718877895&width=500'],
  'HAPPI Health', 'happi'
);

-- ============================================================
-- Verify: all 10 Happi products
-- ============================================================
SELECT id, name, price, category, brand
FROM public.products
WHERE brand_slug = 'happi'
ORDER BY id;