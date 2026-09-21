-- CareHub Point 6: Rename free-sample test rows to real catalog product names.
-- Keeps IDs stable (free_sample_requests.sample_type_id references them).
-- The 3 rows were leftover test data ("thanh thử số 1/2/3" = "test 1/2/3").
-- They map to real products in the catalog for a clean client demo.

UPDATE public.free_samples
SET name = CASE id
  WHEN 'blackmores-thanh-so 1' THEN 'Pregnancy and Breast-Feeding Gold'
  WHEN 'blackmores-thanh-so 2' THEN 'HAPPI Kids Daily Immune+ Lactoferrin'
  WHEN 'Blackmores-thanh-thử-số 3' THEN 'Follow On Formula 2'
  ELSE name
END
WHERE id IN ('blackmores-thanh-so 1', 'blackmores-thanh-so 2', 'Blackmores-thanh-thử-số 3');

-- Verify
SELECT id, name, stock, is_active FROM public.free_samples ORDER BY id;