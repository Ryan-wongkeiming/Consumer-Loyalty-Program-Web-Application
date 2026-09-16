-- CareHub: normalize product category values so filters match exactly.
-- The DB has both "Women's Health" and "Women's health" for the same logical category.
-- Canonical value: "Women's Health" (matches the frontend category list).

UPDATE public.products
SET category = 'Women''s Health'
WHERE category = 'Women''s health';

-- Show the resulting distinct categories for confirmation
SELECT DISTINCT category FROM public.products ORDER BY category;