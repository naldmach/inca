-- Shared rate-limit counters.
--
-- Deliberately in Postgres rather than process memory: on Vercel each
-- serverless instance has its own memory, so an in-process counter would let
-- an attacker spread attempts across instances and never hit a limit.
--
-- Only the service role touches this table. RLS is enabled with no policies,
-- which denies anon and authenticated outright while the service role
-- bypasses it.

CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Atomic increment-and-test. Doing this in one statement avoids the
-- check-then-write race two concurrent login attempts would otherwise win.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, retry_after INTEGER)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rec rate_limits%ROWTYPE;
BEGIN
  INSERT INTO rate_limits AS rl (key, count, window_start)
    VALUES (p_key, 1, now())
  ON CONFLICT (key) DO UPDATE
    SET count = CASE
          WHEN rl.window_start < now() - make_interval(secs => p_window_seconds)
          THEN 1 ELSE rl.count + 1 END,
        window_start = CASE
          WHEN rl.window_start < now() - make_interval(secs => p_window_seconds)
          THEN now() ELSE rl.window_start END
  RETURNING * INTO rec;

  allowed := rec.count <= p_limit;
  retry_after := GREATEST(
    0,
    p_window_seconds - EXTRACT(EPOCH FROM (now() - rec.window_start))::INTEGER
  );
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
