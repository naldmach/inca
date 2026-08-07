import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/auth";
import { countNights, enabledMethods } from "@/lib/payments";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Any signed-in user may book. This is deliberately not admin-gated, but it
// only ever writes a booking owned by the token's user.
export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const propertyId = Number(body.propertyId);
    const checkIn = String(body.checkIn || "");
    const checkOut = String(body.checkOut || "");
    const guests = Number(body.guests);

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: "Property, dates and guests are required" },
        { status: 400 }
      );
    }

    const nights = countNights(checkIn, checkOut);
    if (nights < 1) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    if (checkIn < today) {
      return NextResponse.json(
        { error: "Check-in cannot be in the past" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, price, guests, status, listing_details")
      .eq("id", propertyId)
      .maybeSingle();

    // A missing migration must not masquerade as a missing property
    if (propertyError) {
      if (propertyError.message.includes("listing_details")) {
        return NextResponse.json(
          {
            error:
              "The listing_details column is missing. Run database/add-listing-details.sql in the Supabase SQL Editor.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: propertyError.message },
        { status: 500 }
      );
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    if (property.status !== "active") {
      return NextResponse.json(
        { error: "This property is not accepting bookings" },
        { status: 409 }
      );
    }

    if (guests > property.guests) {
      return NextResponse.json(
        { error: `This place sleeps up to ${property.guests} guests` },
        { status: 400 }
      );
    }

    // Without a payout destination the guest would reach the payment page
    // with nothing to pay to.
    const methods = enabledMethods(property.listing_details?.payment_methods);
    if (methods.length === 0) {
      return NextResponse.json(
        { error: "This host has not set up a way to receive payments yet" },
        { status: 409 }
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        property_id: property.id,
        user_id: decoded.id,
        guest_name: decoded.name,
        guest_email: decoded.email,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        nights,
        total_price: Number(property.price) * nights,
        status: "pending",
        payment_status: "awaiting_payment",
      })
      .select("id")
      .single();

    if (error) {
      if (/user_id|payment_status|nights/.test(error.message)) {
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

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
