import AdminNav from "@/components/admin/AdminNav";
import AdminStats from "@/components/admin/AdminStats";
import UserList from "@/components/admin/UserList";
import PropertyModerationList from "@/components/admin/PropertyModerationList";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4">
          <AdminNav />
        </div>
        <div className="flex-1 flex flex-col gap-8">
          <AdminStats />
          <UserList />
          <PropertyModerationList />
          <AdminSettingsForm />
        </div>
      </div>
    </div>
  );
}
