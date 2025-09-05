"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import AirbnbIntegration from "@/components/admin/AirbnbIntegration";

export default function AirbnbIntegrationPage() {
  const router = useRouter();

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
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Airbnb Integration
              </h1>
              <p className="text-gray-600">
                Connect your properties to Airbnb listings
              </p>
            </div>
            <a
              href="https://www.airbnb.com/users/show/126012540"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Airbnb Profile</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            How to Connect Your Properties to Airbnb
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>
              <strong>Step 1:</strong> Go to your Airbnb host dashboard and find
              your listing
            </p>
            <p>
              <strong>Step 2:</strong> Copy the listing ID from the URL (the
              number after /rooms/)
            </p>
            <p>
              <strong>Step 3:</strong> Link each property below to its
              corresponding Airbnb listing
            </p>
            <p>
              <strong>Step 4:</strong> When customers click "Book on Airbnb",
              they'll be redirected to your actual listing
            </p>
          </div>
        </div>

        {/* Integration Component */}
        <AirbnbIntegration />
      </div>
    </div>
  );
}
