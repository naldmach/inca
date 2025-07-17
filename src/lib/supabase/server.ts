import { createServerClient } from "@supabase/ssr";
import { cookies as getCookies } from "next/headers";

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return (getCookies() as any).get(name)?.value;
        },
        set(name, value, options) {
          // Optionally implement if you need to set cookies server-side
        },
      },
    }
  );
}
