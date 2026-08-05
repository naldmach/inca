import { createClient } from "@supabase/supabase-js";

// Service-role client. This bypasses RLS entirely, so it must only ever be
// used from server-side code (route handlers, server actions, scripts) and
// never imported into a client component.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
