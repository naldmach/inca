import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// This endpoint will be used to sync properties with Airbnb listings
// For now, we'll create a manual mapping system
export async function POST(request: NextRequest) {
  const supabase = createClient();

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
    const { propertyId, airbnbId } = await request.json();

    if (!propertyId || !airbnbId) {
      return NextResponse.json(
        { error: "Property ID and Airbnb ID are required" },
        { status: 400 }
      );
    }

    // Update the property with Airbnb ID
    const { data, error } = await supabase
      .from("properties")
      .update({
        airbnb_id: airbnbId,
        airbnb_synced: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", propertyId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      property: data,
      message: "Property successfully linked to Airbnb listing",
    });
  } catch (error) {
    console.error("Airbnb sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync with Airbnb" },
      { status: 500 }
    );
  }
}

// Get all properties with their Airbnb status
export async function GET(request: NextRequest) {
  const supabase = createClient();

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
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, airbnb_id, airbnb_synced, status")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ properties: data });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}
