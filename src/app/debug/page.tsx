"use client";

import { useState } from "react";

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      // Test database connection
      const dbResponse = await fetch("/api/test");
      const dbResult = await dbResponse.json();

      // Test properties API
      const propsResponse = await fetch("/api/properties");
      const propsResult = await propsResponse.json();

      setTestResults({
        database: dbResult,
        properties: propsResult,
        environment: {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasJwtSecret: !!process.env.JWT_SECRET,
          hasCloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        },
      });
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug Information
        </h1>

        <div className="bg-white rounded-lg shadow-soft p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
          <button
            onClick={runTests}
            disabled={loading}
            className="btn-primary mb-4"
          >
            {loading ? "Running Tests..." : "Run Tests"}
          </button>

          {testResults && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Environment Variables
                </h3>
                <div className="bg-gray-100 p-4 rounded">
                  <pre className="text-sm">
                    {JSON.stringify(testResults.environment, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Database Connection
                </h3>
                <div
                  className={`p-4 rounded ${
                    testResults.database?.success
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <pre className="text-sm">
                    {JSON.stringify(testResults.database, null, 2)}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Properties API
                </h3>
                <div
                  className={`p-4 rounded ${
                    testResults.properties?.properties
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <pre className="text-sm">
                    {JSON.stringify(testResults.properties, null, 2)}
                  </pre>
                </div>
              </div>

              {testResults.error && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Error</h3>
                  <div className="bg-red-100 p-4 rounded">
                    <pre className="text-sm text-red-800">
                      {testResults.error}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            Setup Instructions
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>
              <strong>1. Create .env.local file</strong> with Supabase
              credentials
            </p>
            <p>
              <strong>2. Apply database schema</strong> from database/schema.sql
            </p>
            <p>
              <strong>3. Create admin user</strong> in the users table
            </p>
            <p>
              <strong>4. Test the connection</strong> using the button above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
