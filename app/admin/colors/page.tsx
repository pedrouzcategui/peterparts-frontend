import AdminColorsClient from "@/components/admin/AdminColorsClient";
import { getAdminManagedColors } from "@/lib/admin-colors";

export const dynamic = "force-dynamic";

export default async function AdminColorsPage() {
  const colors = await getAdminManagedColors();

  return <AdminColorsClient initialColors={colors} />;
}