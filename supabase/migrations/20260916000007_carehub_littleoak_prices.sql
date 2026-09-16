-- CareHub: update LittleOak product prices
--
--   Natural Goat Milk Infant Formula  934,000 -> 1,200,000
--   Natural Goat Milk Follow-on Formula 934,000 -> 1,200,000
--   Natural Goat Milk Toddler Milk    934,000 -> 1,180,000
--
-- Updates both the top-level price column and the matching SKU (price +
-- pricePerUnit display string) so every surface shows the same price.

-- Infant Formula
UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-infant-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-infant-formula';

-- Follow-on Formula
UPDATE public.products
SET price = 1200000,
    skus = '[{"id": "littleoak-follow-on-formula-400g", "unit": "hộp", "price": 1200000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,200,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-follow-on-formula';

-- Toddler Milk
UPDATE public.products
SET price = 1180000,
    skus = '[{"id": "littleoak-toddler-milk-400g", "unit": "hộp", "price": 1180000, "title": "400g", "quantity": 1, "pricePerUnit": "₫1,180,000 mỗi hộp"}]'::jsonb
WHERE id = 'littleoak-toddler-milk';

-- Verify
SELECT id, name, price, skus
FROM public.products
WHERE id IN ('littleoak-infant-formula', 'littleoak-follow-on-formula', 'littleoak-toddler-milk')
ORDER BY id;