import { Suspense } from "react";
import PropertyGrid from "@/components/PropertyGrid";
import PropertyFilters from "@/components/PropertyFilters";
import PropertySearch from "@/components/PropertySearch";

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Rental</h1>
        <PropertySearch />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <PropertyFilters />
        </aside>

        <main className="lg:col-span-3">
          <Suspense fallback={<PropertyGridSkeleton />}>
            <PropertyGrid />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
      ))}
    </div>
  );
}
