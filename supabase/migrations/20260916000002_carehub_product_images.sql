-- CareHub: swap placeholder images for real GAIA / LittleOak product photos
-- Hotlinks directly to the brands' public Shopify CDNs (verified HTTP 200, no auth).
-- image = card image (width=500); images = gallery (card image + 2 extra angles where available).
--
-- Run in the Supabase SQL Editor (can be run standalone; the products already exist).

-- ============================================================
-- GAIA Skin Naturals — baby bath time
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_26Square_987318fa-9d12-4f2d-ba66-8ba0120c8278.jpg?v=1781226651&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_26Square_987318fa-9d12-4f2d-ba66-8ba0120c8278.jpg?v=1781226651&width=500',
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabySleeptimeBath500mL-1_8af59144-8e17-4f06-aff8-d80707b40b0a.png?v=1781226711&width=800',
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabySleeptimeBath250mL-1.png?v=1781226675&width=800'
    ]
WHERE id = 'gaia-sleeptime-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_29Square_8bcb4e09-4d9d-4a25-b30a-6e894924e5e5.jpg?v=1781226550&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_29Square_8bcb4e09-4d9d-4a25-b30a-6e894924e5e5.jpg?v=1781226550&width=500'
    ]
WHERE id = 'gaia-hair-body-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_23Square.jpg?v=1781226423&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_23Square.jpg?v=1781226423&width=500'
    ]
WHERE id = 'gaia-bath-body-wash';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/products/DSC_6740.jpg?v=1652856777&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/products/DSC_6740.jpg?v=1652856777&width=500'
    ]
WHERE id = 'gaia-hair-detangler';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/111125_DSC_1636.jpg?v=1781226225&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/111125_DSC_1636.jpg?v=1781226225&width=500'
    ]
WHERE id = 'gaia-sleeptime-bubble-bath';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_4317.jpg?v=1713421973&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_4317.jpg?v=1713421973&width=500'
    ]
WHERE id = 'gaia-2in1-shampoo-conditioner';

-- ============================================================
-- GAIA Skin Naturals — baby skin care
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_20_Aug24Square.jpg?v=1745369031&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/23_GAIA_ProductShoot_20_Aug24Square.jpg?v=1745369031&width=500'
    ]
WHERE id = 'gaia-baby-moisturiser';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/custom_resized_ee1e2363-c36f-4600-8059-58c2dbc0cfb9.jpg?v=1687753567&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/custom_resized_ee1e2363-c36f-4600-8059-58c2dbc0cfb9.jpg?v=1687753567&width=500'
    ]
WHERE id = 'gaia-baby-powder';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_9633.jpg?v=1747804580&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_9633.jpg?v=1747804580&width=500'
    ]
WHERE id = 'gaia-baby-massage-oil';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/IMG_8799_Oct24Square.jpg?v=1733441643&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/IMG_8799_Oct24Square.jpg?v=1733441643&width=500'
    ]
WHERE id = 'gaia-eczema-cream';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabyCradleCapLotion75mL-9.jpg?v=1733443008&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/GAIANaturalBabyCradleCapLotion75mL-9.jpg?v=1733443008&width=500'
    ]
WHERE id = 'gaia-cradle-cap-lotion';

-- ============================================================
-- GAIA Skin Naturals — oral care
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30091Square.jpg?v=1745370294&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30091Square.jpg?v=1745370294&width=500'
    ]
WHERE id = 'gaia-toothpaste-berry';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30005Square_b3071172-ef31-4753-8df9-4365ba8c849d.jpg?v=1745370062&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30005Square_b3071172-ef31-4753-8df9-4365ba8c849d.jpg?v=1745370062&width=500'
    ]
WHERE id = 'gaia-toothpaste-bubblegum';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30099Square.jpg?v=1745369671&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30099Square.jpg?v=1745369671&width=500'
    ]
WHERE id = 'gaia-toothpaste-mint';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/JG30072Square.jpg?v=1745369391&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/JG30072Square.jpg?v=1745369391&width=500'
    ]
WHERE id = 'gaia-toothpaste-smoothie';

-- ============================================================
-- GAIA Skin Naturals — change time
-- ============================================================
UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_0097.jpg?v=1733873700&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_0097.jpg?v=1733873700&width=500'
    ]
WHERE id = 'gaia-nappy-bags';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/products/CottonPads.png?v=1615513088&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/products/CottonPads.png?v=1615513088&width=500'
    ]
WHERE id = 'gaia-cotton-pads';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_6521.jpg?v=1723422122&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_6521.jpg?v=1723422122&width=500'
    ]
WHERE id = 'gaia-water-wipes';

UPDATE public.products
SET image = 'https://gaiaskinnaturals.com/cdn/shop/files/DSC_1659.jpg?v=1748499842&width=500',
    images = ARRAY[
      'https://gaiaskinnaturals.com/cdn/shop/files/DSC_1659.jpg?v=1748499842&width=500'
    ]
WHERE id = 'gaia-pure-water-wipes';

-- ============================================================
-- The Little Oak Company — goat milk formula
-- ============================================================
UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage_1_Front_-_purity_award.jpg?v=1774458198&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage_1_Front_-_purity_award.jpg?v=1774458198&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_1_907e78e4-e5f8-40ac-b416-6023e2c4b979.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-infant-formula';

UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-2-Front---purity-award_69814213-de40-4240-8797-0a39d541ee55.jpg?v=1774458336&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-2-Front---purity-award_69814213-de40-4240-8797-0a39d541ee55.jpg?v=1774458336&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_2_33f0cefb-2007-4d82-82c6-77a27c188625.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-follow-on-formula';

UPDATE public.products
SET image = 'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-3-Front-Purity.jpg?v=1774458226&width=500',
    images = ARRAY[
      'https://cdn.shopify.com/s/files/1/0784/2303/2087/files/Stage-3-Front-Purity.jpg?v=1774458226&width=500',
      'https://thelittleoakcompany.global/cdn/shop/files/Home_page_stage_3_06de040e-0daf-4ca1-9133-7601ab9adb22.webp?v=1776127483&width=800'
    ]
WHERE id = 'littleoak-toddler-milk';