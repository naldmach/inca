import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/auth";
import { uploadPropertyImage } from "@/lib/storage";
import { toListingDetails, type ListingDraft } from "@/lib/listing-wizard";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // Publishing writes to the shared properties table, so it stays behind the
  // same admin gate as every other mutating route.
  if (decoded.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const raw = formData.get("draft");

    if (typeof raw !== "string") {
      return NextResponse.json({ error: "Missing draft" }, { status: 400 });
    }

    const draft = JSON.parse(raw) as ListingDraft;

    if (!draft.title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!draft.street?.trim() || !draft.city?.trim()) {
      return NextResponse.json(
        { error: "Street address and city are required" },
        { status: 400 }
      );
    }

    const photos = formData.getAll("photos") as File[];

    const uploaded = await Promise.all(
      photos.map(async (photo, index) => {
        const { url, path } = await uploadPropertyImage(photo);
        return {
          url,
          path,
          alt_text: `${draft.title} - Image ${index + 1}`,
          is_primary: index === 0,
        };
      })
    );

    const address = [draft.unit, draft.building, draft.street]
      .filter(Boolean)
      .join(", ");

    const bathrooms =
      Number(draft.bathroomsPrivate || 0) +
      Number(draft.bathroomsDedicated || 0) +
      Number(draft.bathroomsShared || 0);

    const supabase = createAdminClient();
    const { data: property, error } = await supabase
      .from("properties")
      .insert({
        title: draft.title.trim(),
        description: draft.description?.trim() || "",
        location: [draft.city, draft.province, "Philippines"]
          .filter(Boolean)
          .join(", "),
        address,
        city: draft.city.trim(),
        state: draft.province?.trim() || "",
        zip_code: draft.zipCode?.trim() || "",
        price: draft.basePrice,
        guests: draft.guests,
        bedrooms: draft.bedrooms,
        bathrooms: bathrooms || 1,
        amenities: draft.amenities || [],
        images: uploaded,
        status: "draft",
        user_id: decoded.id,
        listing_details: toListingDetails(draft),
      })
      .select("id, title, status")
      .single();

    if (error) {
      // The listing_details column ships in database/add-listing-details.sql
      if (error.message.includes("listing_details")) {
        return NextResponse.json(
          {
            error:
              "The listing_details column is missing. Run database/add-listing-details.sql in the Supabase SQL Editor.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    console.error("Listing publish error:", error);
    return NextResponse.json(
      { error: "Failed to publish listing" },
      { status: 500 }
    );
  }
}
