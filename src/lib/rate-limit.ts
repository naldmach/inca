import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "./supabase/admin";

/**
 * Counters live in Postgres (see database/add-rate-limits.sql) because
 * serverless instances do not share memory — an in-process counter would let
 * an attacker spread attempts across instances and never reach a limit.
 */
export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

/** Best-effort client address. Vercel sets x-forwarded-for. */
export function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error || !data || !data[0]) {
      // Fail open rather than locking everyone out if the migration has not
      // been run yet. The missing limiter is reported by the caller's logs.
      console.error("Rate limit check unavailable:", error?.message);
      return { allowed: true, retryAfter: 0 };
    }

    return { allowed: data[0].allowed, retryAfter: data[0].retry_after };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Returns a 429 response when the caller is over the limit, else null. */
export async function enforceRateLimit(
  request: NextRequest,
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<NextResponse | null> {
  const { allowed, retryAfter } = await checkRateLimit(
    `${bucket}:${clientIp(request)}`,
    limit,
    windowSeconds
  );

  if (allowed) return null;

  return NextResponse.json(
    { error: "Too many attempts. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
