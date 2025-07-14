import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.user_metadata?.full_name || user.email}!
      </h1>
      <p className="mb-6 text-gray-600">
        You are logged in as <span className="font-mono">{user.email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
