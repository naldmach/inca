export default function AdminStats() {
  return (
    <div className="flex gap-6 mb-6">
      <div className="bg-blue-100 rounded p-4 flex-1 text-center">
        <div className="text-2xl font-bold">0</div>
        <div className="text-gray-700">Total Users</div>
      </div>
      <div className="bg-green-100 rounded p-4 flex-1 text-center">
        <div className="text-2xl font-bold">0</div>
        <div className="text-gray-700">Total Properties</div>
      </div>
    </div>
  );
}
