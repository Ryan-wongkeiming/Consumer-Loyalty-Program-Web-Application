-- ============================================================
-- CareHub: Data API grants for tables created outside tracked migrations
-- 2026-09-28
-- ============================================================
-- Supabase stops auto-granting Data API access to new tables on Oct 30.
-- These tables exist in the live DB but their CREATE TABLE statements are
-- not in the tracked migrations (only their RLS policies are). This migration
-- makes fresh setups (new project / preview branch / local reset) reach them.
-- ============================================================

-- Public-facing content: readable by everyone (anon + authenticated)
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.topics TO anon, authenticated;
GRANT SELECT ON public.womens_health_products TO anon, authenticated;
GRANT SELECT ON public.womens_health_product_skus TO anon, authenticated;

-- Free sample requests: written only by the request-free-sample edge function
-- (service_role). No direct client access.
GRANT ALL ON public.free_sample_requests TO service_role;

-- Enable RLS on free_sample_requests (Supabase security lint: public tables
-- should have RLS on). service_role bypasses RLS, so the edge function keeps
-- working; anon/authenticated are explicitly blocked.
ALTER TABLE public.free_sample_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on free_sample_requests" ON public.free_sample_requests;
CREATE POLICY "Service role full access on free_sample_requests"
ON public.free_sample_requests
FOR ALL
TO service_role
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Prevent direct user access to free_sample_requests" ON public.free_sample_requests;
CREATE POLICY "Prevent direct user access to free_sample_requests"
ON public.free_sample_requests
FOR ALL
TO anon, authenticated
USING (false) WITH CHECK (false);

-- Service role full access on the public-facing content tables
GRANT ALL ON public.articles TO service_role;
GRANT ALL ON public.topics TO service_role;
GRANT ALL ON public.womens_health_products TO service_role;
GRANT ALL ON public.womens_health_product_skus TO service_role;

-- ============================================================
-- Default privileges: any future table/sequence/function created in public
-- automatically gets Data API grants, so this problem never recurs.
-- ============================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO service_role;
