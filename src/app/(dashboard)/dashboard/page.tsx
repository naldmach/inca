import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import DashboardNav from "@/components/dashboard/DashboardNav";
import UserInfoCard from "@/components/dashboard/UserInfoCard";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <DashboardNav />
        </div>
        <div className="flex-1 flex flex-col items-center gap-6">
          <UserInfoCard
            name={user.user_metadata?.full_name || user.email || "User"}
            email={user.email || "No email"}
          />
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
