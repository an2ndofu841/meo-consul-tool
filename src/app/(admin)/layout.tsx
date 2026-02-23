import { AdminSidebar } from "@/components/layouts/admin-sidebar";
import { AdminHeader } from "@/components/layouts/admin-header";

// In production, fetch from getAppUser(). For now, pass mock data.
const mockUser = {
  full_name: "田中 太郎",
  email: "tanaka@agency.com",
  role: "agency_admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={mockUser} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
