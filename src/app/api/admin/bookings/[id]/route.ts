import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

const ACTIONS = ["confirm", "reject"] as const;
type Action = (typeof ACTIONS)[number];

function isAction(value: unknown): value is Action {
  return typeof value === "string" && ACTIONS.includes(value as Action);
}

/**
 * Host decision on a submitted payment reference.
 *
 * confirm -> payment_status confirmed, booking confirmed.
 * reject  -> payment_status rejected, booking stays pending so the guest can
 *            submit a corrected reference rather than having to rebook.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  try {
    const body = await request.json();
    if (!isAction(body.action)) {
      return NextResponse.json(
        { error: "action must be 'confirm' or 'reject'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: booking, error: lookupError } = await supabase
      .from("bookings")
      .select("id, payment_status")
      .eq("id", id)
      .maybeSingle();

    if (lookupError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Only a reference the guest actually submitted can be decided on, so a
    // booking cannot be confirmed before anyone claims to have paid.
    if (booking.payment_status !== "submitted") {
      return NextResponse.json(
        {
          error: `Nothing to decide: payment is '${booking.payment_status}', not 'submitted'`,
        },
        { status: 409 }
      );
    }

    const updates =
      body.action === "confirm"
        ? { payment_status: "confirmed", status: "confirmed" }
        : { payment_status: "rejected", status: "pending" };

    const { data: updated, error } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", booking.id)
      .select("id, status, payment_status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      JSON.stringify({
        event: "booking.payment_decision",
        booking_id: booking.id,
        action: body.action,
        actor_id: decoded.id,
      })
    );

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Booking decision error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
