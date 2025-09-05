"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Users, Calendar, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  images: Array<{ url: string; is_primary?: boolean; alt_text?: string }>;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    guests: "",
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.guests) params.append("guests", filters.guests);

      const response = await fetch(`/api/properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load properties");
      }
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Stay
          </h1>
          <p className="text-gray-600">
            Discover amazing properties for your next vacation
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              />
            </div>

            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filters.guests}
                onChange={(e) => handleFilterChange("guests", e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              >
                <option value="">Any number of guests</option>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5+ Guests</option>
              </select>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Min price (₱)"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              />
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="Max price (₱)"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <div className="space-y-4">
              <button onClick={fetchProperties} className="btn-primary">
                Try Again
              </button>
              <div className="text-sm text-gray-500">
                <p>If the problem persists, check:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Database connection</li>
                  <li>Environment variables</li>
                  <li>Supabase configuration</li>
                </ul>
              </div>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-600 text-lg mb-4">
              No properties found
            </div>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const primaryImage =
                property.images?.find((img) => img.is_primary) ||
                property.images?.[0];

              return (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <div className="card-hover">
                    <div className="relative h-48">
                      {primaryImage ? (
                        <Image
                          src={primaryImage.url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 shadow-sm border">
                        ₱{property.price}/night
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {property.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{property.location}</p>

                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{property.bedrooms} bed</span>
                        <span>{property.bathrooms} bath</span>
                        <span>{property.guests} guests</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
