-- CareHub: Buy More Save More (bundle tiers) + subscription master plan
--
-- Part 1: bundle_pricing JSONB column — buy more, save more
--   Format: [{"quantity": 3, "discountPercent": 20, "label": "-20%"}, ...]
--   discountPercent is OFF the base price. Applied on top of subscription.
--
-- Part 2: Category synchronization with the existing filter taxonomy
--   - 'Adult Vitamins' (Happi)  -> merged into 'Vitamins' (existing)
--   - 'Kids Vitamins'  (Happi)  -> 'Kids Supplements'  (new, significant)
--   - 'Baby Vitamins'  (Happi)  -> 'Baby Supplements'  (new, significant)
--
-- Part 3: Seed bundle tiers for the 4 Happi supplement products (from
--   https://happihealth.com.au — their live Buy More Save More tiers).
--   Infant formula packs (6 x 600g) are already multi-packs: no bundle tiers.

-- ============================================================
-- 1. Add bundle_pricing column
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS bundle_pricing JSONB;

-- ============================================================
-- 2. Category synchronization
-- ============================================================
UPDATE public.products
SET category = 'Vitamins'
WHERE category IN ('Adult Vitamins', 'Kids Vitamins', 'Baby Vitamins');

-- ============================================================
-- 3. Seed bundle tiers for the 4 Happi supplements
--    Base prices (VND, A$1 = 17,000):
--      Adult Daily Immune+   A$52.99 -> 900,000
--      Women's Daily Iron+   A$44.99 -> 765,000
--      Kids Daily Immune+    A$29.99 -> 510,000
--      Baby Lactoferrin Pwdr A$44.99 -> 765,000
--    Tiers: 1 = 0% (implicit), 3 = -20%, 5 = -35% (Happi's live labels)
-- ============================================================
UPDATE public.products SET bundle_pricing = '[
  {"quantity": 3, "discountPercent": 20, "label": "-20%"},
  {"quantity": 5, "discountPercent": 35, "label": "-35%"}
]'::jsonb
WHERE id IN (
  'happi-adult-daily-immune',
  'happi-womens-daily-iron',
  'happi-kids-daily-immune',
  'happi-baby-lactoferrin-powder'
);

-- ============================================================
-- Verify
-- ============================================================
SELECT id, name, category, price, bundle_pricing
FROM public.products
WHERE brand_slug = 'happi'
ORDER BY id;