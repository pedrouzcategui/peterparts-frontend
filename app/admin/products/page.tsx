import AdminProductsTableClient from "@/components/admin/AdminProductsTableClient";
import {
  getAdminExchangeRate,
  getAdminProducts,
} from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, latestExchangeRate] = await Promise.all([
    getAdminProducts(),
    getAdminExchangeRate(),
  ]);

  return (
    <AdminProductsTableClient
      initialProducts={products}
      latestExchangeRate={latestExchangeRate}
    />
  );
}
