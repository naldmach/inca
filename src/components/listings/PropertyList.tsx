"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Property {
  id: string;
  title: string;
  city: string;
  state: string;
  price_per_month: number;
  description: string;
}

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperties() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data.properties || []);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError("Failed to load properties");
      }
      setLoading(false);
    }
    fetchProperties();
  }, []);

  if (loading) return <div>Loading properties...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!properties.length) return <div>No properties found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link
          key={property.id}
          href={`/properties/${property.id}`}
          className="block"
        >
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
            <h2 className="text-lg font-bold mb-2">{property.title}</h2>
            <p className="text-gray-600 mb-2">
              {property.city}, {property.state}
            </p>
            <p className="text-gray-800 font-semibold mb-2">
              ${property.price_per_month}/mo
            </p>
            <p className="text-sm text-gray-500 mb-2">{property.description}</p>
            {/* Add more property details and images here */}
          </div>
        </Link>
      ))}
    </div>
  );
}
