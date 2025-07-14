"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
