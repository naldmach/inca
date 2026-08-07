import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/auth";
import { enabledMethods, getMethodSpec } from "@/lib/payments";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Resolves the booking only when the caller owns it (or is an admin). The
// host's payout details ride on this response, so this check is what keeps
// them from being readable by anyone with a booking id.
async function loadOwnBooking(request: NextRequest, id: string) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 } as const;

  const decoded = verifyToken(token);
  if (!decoded) return { error: "Invalid token", status: 401 } as const;

  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return { error: "Booking not found", status: 404 } as const;
  }

  if (booking.user_id !== decoded.id && decoded.role !== "admin") {
    return { error: "Forbidden", status: 403 } as const;
  }

  return { booking, decoded, supabase } as const;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadOwnBooking(request, id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { booking, supabase } = result;

  const { data: property } = await supabase
    .from("properties")
    .select("id, title, city, price, images, listing_details")
    .eq("id", booking.property_id)
    .maybeSingle();

  return NextResponse.json({
    booking,
    property: property
      ? {
          id: property.id,
          title: property.title,
          city: property.city,
          price: property.price,
          images: property.images,
        }
      : null,
    // Only the fully configured methods, so the guest never sees a partial one
    paymentMethods: enabledMethods(property?.listing_details?.payment_methods),
    paymentDetails: property?.listing_details?.payment_methods ?? {},
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadOwnBooking(request, id);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const { booking, supabase } = result;

  try {
    const body = await request.json();
    const method = String(body.paymentMethod || "");
    const reference = String(body.paymentReference || "").trim();

    if (!getMethodSpec(method)) {
      return NextResponse.json(
        { error: "Choose a payment method" },
        { status: 400 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: "Enter the reference number from your transfer" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        payment_method: method,
        payment_reference: reference,
        payment_status: "submitted",
      })
      .eq("id", booking.id)
      .select("id, payment_status, payment_method, payment_reference")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error("Payment submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
