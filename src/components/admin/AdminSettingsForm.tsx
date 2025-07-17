export default function AdminSettingsForm() {
  return (
    <form className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Platform Settings</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Site Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="InCA Homes"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Contact Email</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="admin@example.com"
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-6 rounded font-semibold hover:bg-blue-700 transition"
      >
        Save Settings
      </button>
    </form>
  );
}
