import PropertyList from "@/components/listings/PropertyList";

export default function PropertiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Properties</h1>
      <PropertyList />
    </div>
  );
}
