-- CareHub mobile-friendly images: bump CDN width 500 -> 800 (FIXED, copy-paste safe)
-- Run this whole block in Supabase SQL Editor. Uses simple string replace (no regex
-- escaping pitfalls), and reports what it changed.

-- 1) Main card image: Shopify CDN
UPDATE public.products
SET image = replace(image, '&width=500', '&width=800')
WHERE image LIKE '%cdn.shopify.com%&width=500%';

-- 2) Main card image: GAIA CDN
UPDATE public.products
SET image = replace(image, '&width=500', '&width=800')
WHERE image LIKE '%gaiaskinnaturals.com%&width=500%';

-- 3) Gallery images (image[] column): Shopify CDN
UPDATE public.products
SET images = (
  SELECT array_agg(replace(img, '&width=500', '&width=800'))
  FROM unnest(images) AS img
)
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img
  WHERE img LIKE '%cdn.shopify.com%&width=500%'
);

-- 4) Gallery images (image[] column): GAIA CDN
UPDATE public.products
SET images = (
  SELECT array_agg(replace(img, '&width=500', '&width=800'))
  FROM unnest(images) AS img
)
WHERE EXISTS (
  SELECT 1 FROM unnest(images) AS img
  WHERE img LIKE '%gaiaskinnaturals.com%&width=500%'
);

-- 5) Verify: how many products still have width=500 (should be 0)
SELECT count(*) AS remaining_width_500 FROM public.products
WHERE image LIKE '%&width=500%'
   OR EXISTS (SELECT 1 FROM unnest(images) AS img WHERE img LIKE '%&width=500%');