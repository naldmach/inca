import Link from "next/link";

export default function AdminNav() {
  return (
    <nav className="flex flex-col gap-4 p-4 bg-gray-200 rounded shadow">
      <Link href="/admin" className="font-semibold hover:underline">
        Admin Home
      </Link>
      <Link href="/admin/users" className="hover:underline">
        Users
      </Link>
      <Link href="/admin/properties" className="hover:underline">
        Properties
      </Link>
      <Link href="/admin/moderation" className="hover:underline">
        Moderation
      </Link>
      <Link href="/admin/settings" className="hover:underline">
        Settings
      </Link>
    </nav>
  );
}
