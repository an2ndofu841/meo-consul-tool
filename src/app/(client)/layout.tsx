import { ClientSidebar } from "@/components/layouts/client-sidebar";
import { ClientHeader } from "@/components/layouts/client-header";

// In production, fetch from getAppUser(). For now, pass mock data.
const mockUser = {
  full_name: "鈴木 一郎",
  email: "suzuki@client.com",
  role: "client_viewer",
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ClientHeader user={mockUser} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
