-- CareHub: mark Blackmores Jnr Balance Plus as sold out
-- (id: blackmores-jnr-balance-plus, price 690,000 VND)

UPDATE public.products
SET in_stock = false
WHERE id = 'blackmores-jnr-balance-plus';

-- Verify
SELECT id, name, price, in_stock
FROM public.products
WHERE id = 'blackmores-jnr-balance-plus';