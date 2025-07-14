import PropertyCreateForm from "@/components/listings/PropertyCreateForm";

export default function ListingsPage() {
  return (
    <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Add New Property</h1>
      <PropertyCreateForm />
    </div>
  );
}
