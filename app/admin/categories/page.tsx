import AdminCategoriesClient from "@/components/admin/AdminCategoriesClient";
import { getAdminManagedCategories } from "@/lib/admin-categories";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminManagedCategories();

  return <AdminCategoriesClient initialCategories={categories} />;
}