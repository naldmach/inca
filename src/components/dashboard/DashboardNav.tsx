import Link from "next/link";

export default function DashboardNav() {
  return (
    <nav className="flex flex-col gap-4 p-4 bg-gray-100 rounded shadow">
      <Link href="/dashboard" className="font-semibold hover:underline">
        Dashboard Home
      </Link>
      <Link href="/dashboard/properties" className="hover:underline">
        My Properties
      </Link>
      <Link href="/dashboard/profile" className="hover:underline">
        Profile
      </Link>
      <Link href="/dashboard/settings" className="hover:underline">
        Settings
      </Link>
    </nav>
  );
}
