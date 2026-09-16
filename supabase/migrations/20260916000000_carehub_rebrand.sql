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