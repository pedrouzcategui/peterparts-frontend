import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { requireAdminPageAccess } from "@/lib/auth/admin";
import { getAdminHeaderModerationSummary } from "@/lib/forum";

export const metadata: Metadata = {
  title: {
    default: "Panel de administracion",
    template: "%s | Administracion - PeterParts",
  },
  description: "Panel de administracion de PeterParts",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminPageAccess("/admin");
  const moderationSummary = await getAdminHeaderModerationSummary();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader
          currentUser={{
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            email: user.email,
          }}
          moderationSummary={moderationSummary}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
