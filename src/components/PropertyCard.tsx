import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price_per_month: number;
    city: string;
    state: string;
    bedrooms: number;
    bathrooms: number;
    square_feet: number | null;
    property_type: string;
    available_from: string | null;
    images: {
      id: string;
      url: string;
      alt_text: string | null;
      sort_order: number;
    }[];
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage =
    property.images.find((img) => img.sort_order === 0) || property.images[0];

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative h-48">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || property.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
            {formatPrice(property.price_per_month)}/mo
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>

          <div className="flex items-center text-gray-600 mb-2">
            <span className="text-sm">
              {property.city}, {property.state}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>{property.bedrooms} bed</span>
            <span>{property.bathrooms} bath</span>
            {property.square_feet && <span>{property.square_feet} sq ft</span>}
          </div>

          <div className="flex items-center justify-between">
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs capitalize">
              {property.property_type}
            </span>
            {property.available_from && (
              <span className="text-xs text-gray-500">
                Available{" "}
                {new Date(property.available_from).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
