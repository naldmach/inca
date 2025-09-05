"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Link,
  Unlink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Property {
  id: number;
  title: string;
  airbnb_id: string | null;
  airbnb_synced: boolean;
  status: string;
}

export default function AirbnbIntegration() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProperty, setEditingProperty] = useState<number | null>(null);
  const [airbnbId, setAirbnbId] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/airbnb/sync");
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);
      } else {
        setError("Failed to fetch properties");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProperty = async (propertyId: number) => {
    if (!airbnbId.trim()) {
      alert("Please enter an Airbnb listing ID");
      return;
    }

    try {
      const response = await fetch("/api/airbnb/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          airbnbId: airbnbId.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProperties(
          properties.map((p) =>
            p.id === propertyId
              ? {
                  ...p,
                  airbnb_id: data.property.airbnb_id,
                  airbnb_synced: true,
                }
              : p
          )
        );
        setEditingProperty(null);
        setAirbnbId("");
        alert("Property successfully linked to Airbnb!");
      } else {
        const errorData = await response.json();
        alert(`Failed to link property: ${errorData.error}`);
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  const handleUnlinkProperty = async (propertyId: number) => {
    if (
      !confirm("Are you sure you want to unlink this property from Airbnb?")
    ) {
      return;
    }

    try {
      const response = await fetch("/api/airbnb/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          airbnbId: null,
        }),
      });

      if (response.ok) {
        setProperties(
          properties.map((p) =>
            p.id === propertyId
              ? { ...p, airbnb_id: null, airbnb_synced: false }
              : p
          )
        );
        alert("Property unlinked from Airbnb");
      } else {
        alert("Failed to unlink property");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  const getAirbnbUrl = (airbnbId: string) => {
    return `https://www.airbnb.com/rooms/${airbnbId}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Airbnb Integration
          </h2>
          <p className="text-gray-600 mt-1">
            Link your properties to Airbnb listings for seamless booking
            redirection
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Linked</span>
          <AlertCircle className="h-4 w-4 text-orange-500 ml-4" />
          <span>Not Linked</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {properties.map((property) => (
          <div
            key={property.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-900">
                    {property.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.airbnb_synced
                        ? "bg-green-100 text-green-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {property.airbnb_synced ? "Linked" : "Not Linked"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : property.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {property.status}
                  </span>
                </div>

                {property.airbnb_id && (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Airbnb ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {property.airbnb_id}
                    </code>
                    <a
                      href={getAirbnbUrl(property.airbnb_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-sm">View on Airbnb</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {editingProperty === property.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={airbnbId}
                      onChange={(e) => setAirbnbId(e.target.value)}
                      placeholder="Enter Airbnb listing ID"
                      className="px-3 py-1 border border-gray-300 rounded text-sm text-black"
                    />
                    <button
                      onClick={() => handleLinkProperty(property.id)}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Link
                    </button>
                    <button
                      onClick={() => {
                        setEditingProperty(null);
                        setAirbnbId("");
                      }}
                      className="btn-outline text-sm px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {property.airbnb_synced ? (
                      <>
                        <button
                          onClick={() => handleUnlinkProperty(property.id)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <Unlink className="h-4 w-4" />
                          <span>Unlink</span>
                        </button>
                        <a
                          href={getAirbnbUrl(property.airbnb_id!)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View</span>
                        </a>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditingProperty(property.id)}
                        className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                      >
                        <Link className="h-4 w-4" />
                        <span>Link to Airbnb</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No properties found</div>
          <p className="text-sm text-gray-400">
            Create some properties first to link them to Airbnb listings
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">
          How to find Airbnb Listing IDs:
        </h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Go to your Airbnb listing page</li>
          <li>2. Look at the URL: https://www.airbnb.com/rooms/[LISTING_ID]</li>
          <li>3. Copy the number after "/rooms/"</li>
          <li>4. Paste it in the "Airbnb listing ID" field above</li>
        </ol>
      </div>
    </div>
  );
}
