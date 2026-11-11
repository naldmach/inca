-- CRITICAL: close public read/write access to the database.
--
-- schema.sql, migration.sql and complete-setup.sql all created
-- "FOR ALL USING (true)" policies on users, properties, bookings and
-- analytics. That grants the anon role - the key embedded in every browser
-- bundle - full read and write on all four tables: password hashes, guest
-- names and emails, payment references, and the ability to insert a row with
-- role 'admin'.
--
-- Safe to run against the current code: every write and every read of
-- non-public data now goes through the service-role client, which bypasses
-- RLS. The only thing anon still needs is reading active listings, which the
-- one policy below restores.
--
-- Drops are done by lookup rather than by name because the live policy names
-- may differ from what is in the repo.

-- 1. users, bookings, analytics: no anon or authenticated access at all.
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'bookings', 'analytics')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- 2. properties: drop everything, then restore public read of active listings
--    only. The public site reads this with the anon key.
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'properties'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.properties', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Public can view active properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- 3. RLS on everywhere. With it enabled and no policy, the table denies anon
--    and authenticated while the service role still bypasses it.
ALTER TABLE public.users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics  ENABLE ROW LEVEL SECURITY;

-- 4. Verify. Expect rls_enabled = true on all four, and exactly one policy
--    ("Public can view active properties" on properties).
SELECT relname AS table_name, relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname IN ('users', 'properties', 'bookings', 'analytics', 'rate_limits')
ORDER BY relname;

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
