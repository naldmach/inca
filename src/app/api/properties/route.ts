import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { uploadPropertyImage } from "@/lib/storage";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

// Allowlist for the property-creation body. Unknown keys are stripped by
// zod's default object behaviour and never reach the insert.
const propertyInputSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional().default(""),
  location: z.string().min(2).max(255),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(255),
  state: z.string().min(2).max(255),
  zip_code: z.string().min(3).max(20),
  price: z.number().positive().max(10_000_000),
  guests: z.number().int().min(1).max(100),
  bedrooms: z.number().int().min(0).max(50),
  bathrooms: z.number().int().min(0).max(50),
  amenities: z.array(z.string().max(100)).max(100).optional(),
  status: z.enum(["draft", "active", "inactive"]),
  airbnb_id: z.string().max(255).optional(),
});

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

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
  const supabase = createAdminClient();

  // Check authentication
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
    const formData = await request.formData();
    const raw = JSON.parse(formData.get("propertyData") as string);
    const images = formData.getAll("images") as File[];

    const parsed = propertyInputSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid property data" },
        { status: 400 }
      );
    }
    const propertyData = parsed.data;

    // Built field by field rather than spreading the request body, so a
    // caller cannot set columns the form does not own (user_id, airbnb_synced,
    // listing_details, created_at).
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        address: propertyData.address,
        city: propertyData.city,
        state: propertyData.state,
        zip_code: propertyData.zip_code,
        price: propertyData.price,
        guests: propertyData.guests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        status: propertyData.status,
        airbnb_id: propertyData.airbnb_id ?? null,
        user_id: decoded.id,
        images: [], // Will be updated after image upload
        amenities: propertyData.amenities || [],
      })
      .select()
      .single();

    if (propertyError) {
      return NextResponse.json(
        { error: propertyError.message },
        { status: 500 }
      );
    }

    // Upload images to Supabase Storage
    const imagePromises = images.map(async (image, index) => {
      const { url, path } = await uploadPropertyImage(image);

      return {
        url,
        path,
        alt_text: `${propertyData.title} - Image ${index + 1}`,
        is_primary: index === 0,
      };
    });

    const uploadedImages = await Promise.all(imagePromises);

    // Update property with images
    const { error: updateError } = await supabase
      .from("properties")
      .update({ images: uploadedImages })
      .eq("id", property.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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
