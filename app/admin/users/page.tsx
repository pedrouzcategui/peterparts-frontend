import AdminUsersClient from "@/components/admin/AdminUsersClient";
import { getAdminUsersOverview } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { users, stats } = await getAdminUsersOverview();

  return <AdminUsersClient initialUsers={users} initialStats={stats} />;
}
