-- CareHub mobile-friendly images: bump Shopify CDN width 500 -> 800
-- Applies to product card + gallery images. Non-Shopify URLs are untouched.
-- Run this in Supabase SQL Editor.

-- 1) Main card image
UPDATE public.products
SET image = regexp_replace(image, '&width=\\d+', '&width=800', 'g')
WHERE image LIKE '%cdn.shopify.com%' AND image LIKE '%&width=%';

-- 2) Gallery images (image[] column)
UPDATE public.products
SET images = (
  SELECT array_agg(regexp_replace(img, '&width=\\d+', '&width=800', 'g'))
  FROM unnest(images) AS img
)
WHERE images IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(images) AS img
    WHERE img LIKE '%cdn.shopify.com%' AND img LIKE '%&width=%'
  );

-- 3) GAIA images (gaiaskinnaturals.com/cdn/shop/...)
UPDATE public.products
SET image = regexp_replace(image, '&width=\\d+', '&width=800', 'g')
WHERE image LIKE '%gaiaskinnaturals.com/cdn/shop/%' AND image LIKE '%&width=%';

UPDATE public.products
SET images = (
  SELECT array_agg(regexp_replace(img, '&width=\\d+', '&width=800', 'g'))
  FROM unnest(images) AS img
)
WHERE images IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(images) AS img
    WHERE img LIKE '%gaiaskinnaturals.com/cdn/shop/%' AND img LIKE '%&width=%'
  );

-- Verify: show remaining width=500 URLs (should be 0 for Shopify/GAIA)
SELECT id, image FROM public.products
WHERE image LIKE '%&width=500%'
LIMIT 10;