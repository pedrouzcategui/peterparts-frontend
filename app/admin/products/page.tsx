import AdminProductsClient from "@/components/admin/AdminProductsClient";
import { getAdminProducts } from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return <AdminProductsClient initialProducts={products} />;
}
