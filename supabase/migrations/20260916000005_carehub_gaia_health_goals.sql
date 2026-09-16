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