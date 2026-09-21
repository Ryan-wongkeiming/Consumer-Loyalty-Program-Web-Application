-- Diagnostic: why does the anon order insert fail?
-- Run this in Supabase SQL Editor and paste the results.

-- 1. What INSERT policies exist on orders?
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders'
ORDER BY cmd;

-- 2. Is RLS enabled on orders?
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'orders';

-- 3. Test the insert directly as the anon role would (simulate)
--    (This tells us the exact error the app hits)
SET ROLE anon;
INSERT INTO orders (full_name, phone, email, address, city, ward, notes, total_amount, promo_code_applied, user_id)
VALUES ('Test Trigger', '+85512345678', 'test@test.com', 'Test St 1', 'Phnom Penh', '1', 'trigger test', 500000, 'giadinhdaudau88', NULL);
-- If the above errors, that's the bug. If it succeeds, clean up:
-- DELETE FROM orders WHERE full_name = 'Test Trigger' AND email = 'test@test.com';
RESET ROLE;