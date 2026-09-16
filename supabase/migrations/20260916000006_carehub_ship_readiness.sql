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