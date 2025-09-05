"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";

export default function NewPropertyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("propertyData", JSON.stringify(data));

      // Add images to form data
      data.images.forEach((image: File) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/properties", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/admin/properties");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create property");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Property
              </h1>
              <p className="text-gray-600">Create a new property listing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <PropertyForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
