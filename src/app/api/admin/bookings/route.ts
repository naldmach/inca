import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

/** Host view of every booking, newest first. Admin only. */
export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (/payment_status|user_id|nights/.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "The bookings table is missing the payment columns. Run database/add-booking-payments.sql in the Supabase SQL Editor.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach titles without an N+1: one lookup for the properties referenced.
  const ids = [...new Set((bookings || []).map((b) => b.property_id))];
  const { data: properties } = ids.length
    ? await supabase.from("properties").select("id, title, city").in("id", ids)
    : { data: [] };

  const byId = new Map((properties || []).map((p) => [p.id, p]));

  return NextResponse.json({
    bookings: (bookings || []).map((b) => ({
      ...b,
      property: byId.get(b.property_id) ?? null,
    })),
  });
}
