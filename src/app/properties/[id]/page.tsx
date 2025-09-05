import { notFound } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

// Comprehensive type definitions for property-related data
interface PropertyImage {
  url: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  available_from?: string;
  airbnb_id?: string;
  images?: PropertyImage[];
  amenities?: string[];
}

async function getProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/properties/${id}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error(`HTTP error! status: ${res.status}`);
      return null;
    }

    const data = await res.json();

    if (data.property) {
      return data.property as Property;
    }

    return null;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);

  return {
    title: property ? property.title : "Property Not Found",
    description: property
      ? property.description
      : "Property details not available",
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);

  if (!property) return notFound();

  const primaryImage =
    property.images?.find((img) => img.is_primary) || property.images?.[0];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{property.title}</h1>

      {/* Image Gallery */}
      <div className="mb-6">
        {primaryImage ? (
          <div className="relative w-full h-96 rounded-lg overflow-hidden mb-4">
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || property.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
            <span className="text-gray-500 text-lg">No images available</span>
          </div>
        )}

        {/* Additional Images */}
        {property.images && property.images.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {property.images.slice(1, 5).map((img, index) => (
              <div
                key={index}
                className="relative w-full h-24 rounded overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={img.alt_text || property.title}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
            <p className="text-gray-800 leading-relaxed">
              {property.description}
            </p>
          </div>

          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center text-gray-800">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatPrice(property.price)}/night
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Guests:</span>
                <span className="font-semibold text-gray-900">{property.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Bedrooms:</span>
                <span className="font-semibold text-gray-900">{property.bedrooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Bathrooms:</span>
                <span className="font-semibold text-gray-900">{property.bathrooms}</span>
              </div>
              {property.available_from && (
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">Available From:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(property.available_from).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2 text-gray-900">Location</h3>
              <p className="text-gray-800">
                {property.address}
                <br />
                {property.city}, {property.state} {property.zip_code}
              </p>
            </div>

            {property.airbnb_id ? (
              <a
                href={`https://www.airbnb.com/rooms/${property.airbnb_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center space-x-2"
              >
                <span>Book on Airbnb</span>
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            ) : (
              <button className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed">
                Booking Not Available
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


