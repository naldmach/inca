import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

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
    const sampleProperties = [
      {
        title: "Beautiful Beachfront Villa",
        description:
          "Stunning oceanfront property with panoramic views, perfect for a relaxing getaway. Features modern amenities and direct beach access.",
        location: "Miami Beach",
        address: "123 Ocean Drive",
        city: "Miami",
        state: "FL",
        zip_code: "33139",
        price: 250,
        guests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["WiFi", "Kitchen", "Parking", "Pool", "Beach Access"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
            public_id: "sample-beach-villa-1",
            alt_text: "Beautiful beachfront villa exterior",
            is_primary: true,
          },
        ],
        status: "active",
        airbnb_id: "12345678",
        airbnb_synced: true,
        user_id: decoded.id,
      },
      {
        title: "Cozy Mountain Cabin",
        description:
          "Rustic mountain retreat with fireplace and stunning mountain views. Perfect for nature lovers and outdoor enthusiasts.",
        location: "Aspen Mountains",
        address: "456 Mountain View Road",
        city: "Aspen",
        state: "CO",
        zip_code: "81611",
        price: 180,
        guests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: [
          "WiFi",
          "Kitchen",
          "Fireplace",
          "Mountain Views",
          "Hiking Trails",
        ],
        images: [
          {
            url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            public_id: "sample-mountain-cabin-1",
            alt_text: "Cozy mountain cabin with fireplace",
            is_primary: true,
          },
        ],
        status: "active",
        airbnb_id: "87654321",
        airbnb_synced: true,
        user_id: decoded.id,
      },
      {
        title: "Modern Downtown Loft",
        description:
          "Stylish urban loft in the heart of the city. Features high ceilings, exposed brick, and modern appliances.",
        location: "Downtown",
        address: "789 City Center Blvd",
        city: "New York",
        state: "NY",
        zip_code: "10001",
        price: 300,
        guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["WiFi", "Kitchen", "Gym", "Rooftop Access", "City Views"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
            public_id: "sample-downtown-loft-1",
            alt_text: "Modern downtown loft interior",
            is_primary: true,
          },
        ],
        status: "active",
        airbnb_id: null,
        airbnb_synced: false,
        user_id: decoded.id,
      },
    ];

    const { data, error } = await supabase
      .from("properties")
      .insert(sampleProperties)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Sample properties created successfully",
      properties: data,
    });
  } catch (error) {
    console.error("Sample data creation error:", error);
    return NextResponse.json(
      { error: "Failed to create sample data" },
      { status: 500 }
    );
  }
}
