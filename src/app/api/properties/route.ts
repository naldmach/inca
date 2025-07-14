import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const city = searchParams.get("city");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const propertyType = searchParams.get("propertyType");

  let query = supabase
    .from("properties")
    .select(
      `
      *,
      images:property_images(*),
      amenities:property_amenities(*),
      profile:profiles(*)
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (city) query = query.ilike("city", `%${city}%`);
  if (minPrice) query = query.gte("price_per_month", parseInt(minPrice));
  if (maxPrice) query = query.lte("price_per_month", parseInt(maxPrice));
  if (propertyType) query = query.eq("property_type", propertyType);

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
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        user_id: user.id,
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

      return supabase.from("property_images").insert({
        property_id: property.id,
        cloudinary_public_id: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        alt_text: `${propertyData.title} - Image ${index + 1}`,
        sort_order: index,
      });
    });

    await Promise.all(imagePromises);

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Property creation error:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
