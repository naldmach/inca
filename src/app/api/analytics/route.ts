import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  let supabase;
  try {
    supabase = createClient();
  } catch (error) {
    return NextResponse.json(
      { error: "Database connection failed. Please check environment variables." },
      { status: 500 }
    );
  }

  // Check authentication
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    // Get property counts
    const { count: totalProperties } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true });

    const { count: activeProperties } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get booking counts
    const { count: totalBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    // Calculate monthly revenue (placeholder calculation)
    const { data: bookings } = await supabase
      .from("bookings")
      .select("total_price")
      .gte(
        "created_at",
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString()
      );

    const monthlyRevenue =
      bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) ||
      0;

    const stats = {
      totalProperties: totalProperties || 0,
      activeProperties: activeProperties || 0,
      totalBookings: totalBookings || 0,
      monthlyRevenue: Math.round(monthlyRevenue),
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
