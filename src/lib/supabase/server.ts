import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client for public reads (active property listings).
 *
 * It carries no session: the app authenticates with its own JWT cookie, not
 * Supabase Auth, so there is nothing to read from cookies here. The previous
 * version cast `cookies()` through `any` to read one, which returned
 * undefined under Next 14 and would have returned a Promise under Next 15.
 *
 * Anything that writes, or reads data a visitor should not see, must use
 * `createAdminClient()` instead — this client is bound by RLS.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
