import { notFound } from "next/navigation";
import Image from "next/image";

async function getProperty(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/properties?id=eq.${id}&select=*,images:property_images(*),amenities:property_amenities(*)`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      cache: "no-store",
    }
  );
  const data = await res.json();
  return data[0];
}

type Props = { params: { id: string } };

export default async function PropertyDetailPage({ params }: Props) {
  const property = await getProperty(params.id);
  if (!property) return notFound();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{property.title}</h1>
      <div className="mb-6 flex flex-wrap gap-4">
        {property.images && property.images.length > 0 ? (
          property.images.map((img: any) => (
            <div
              key={img.id}
              className="relative w-64 h-40 rounded overflow-hidden border"
            >
              <Image
                src={img.url}
                alt={img.alt_text || property.title}
                fill
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <div className="w-64 h-40 bg-gray-200 flex items-center justify-center rounded">
            No images
          </div>
        )}
      </div>
      <div className="mb-4 text-lg text-gray-700">{property.description}</div>
      <div className="mb-4 flex gap-8">
        <div>
          <span className="font-semibold">Price:</span> $
          {property.price_per_month}/mo
        </div>
        <div>
          <span className="font-semibold">Type:</span> {property.property_type}
        </div>
        <div>
          <span className="font-semibold">Bedrooms:</span> {property.bedrooms}
        </div>
        <div>
          <span className="font-semibold">Bathrooms:</span> {property.bathrooms}
        </div>
      </div>
      <div className="mb-4">
        <span className="font-semibold">Address:</span> {property.address},{" "}
        {property.city}, {property.state} {property.zip_code}
      </div>
      {property.amenities && property.amenities.length > 0 && (
        <div className="mb-4">
          <span className="font-semibold">Amenities:</span>
          <ul className="list-disc ml-6 mt-2">
            {property.amenities.map((a: any) => (
              <li key={a.id}>{a.amenity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
