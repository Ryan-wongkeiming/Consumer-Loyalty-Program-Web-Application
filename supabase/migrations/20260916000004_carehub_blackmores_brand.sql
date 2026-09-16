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