import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const guests = searchParams.get("guests");
  const status = searchParams.get("status") || "active"; // Default to active for public

  let query = supabase
    .from("properties")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (city) query = query.ilike("city", `%${city}%`);
  if (minPrice) query = query.gte("price", parseInt(minPrice));
  if (maxPrice) query = query.lte("price", parseInt(maxPrice));
  if (guests) query = query.gte("guests", parseInt(guests));

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to).limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    properties: data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();

  // Check authentication
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const propertyData = JSON.parse(formData.get("propertyData") as string);
    const images = formData.getAll("images") as File[];

    // Create property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        ...propertyData,
        user_id: decoded.id,
        images: [], // Will be updated after image upload
        amenities: propertyData.amenities || []
      })
      .select()
      .single();

    if (propertyError) {
      return NextResponse.json(
        { error: propertyError.message },
        { status: 500 }
      );
    }

    // Upload images to Cloudinary
    const imagePromises = images.map(async (image, index) => {
      const buffer = Buffer.from(await image.arrayBuffer());
      const cloudinaryResult = await uploadToCloudinary(buffer);

      return {
        url: cloudinaryResult.secure_url,
        public_id: cloudinaryResult.public_id,
        alt_text: `${propertyData.title} - Image ${index + 1}`,
        is_primary: index === 0
      };
    });

    const uploadedImages = await Promise.all(imagePromises);

    // Update property with images
    const { error: updateError } = await supabase
      .from("properties")
      .update({ images: uploadedImages })
      .eq("id", property.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
