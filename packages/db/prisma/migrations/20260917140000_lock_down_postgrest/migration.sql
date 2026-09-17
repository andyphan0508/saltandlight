-- The app reads and writes Postgres only through Prisma (a role that bypasses RLS),
-- but Supabase also serves every public table over its REST API to anyone holding
-- the anon key, which ships in the browser bundle. supabase/security-hardening.sql
-- listed tables by hand and was never re-run for newer ones, so customers, orders,
-- admin_users and audit_logs were readable (and writable) from the internet.
--
-- This locks down every table that exists now, and revokes the default grants so
-- tables created by future migrations start closed too.

DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon, authenticated;
