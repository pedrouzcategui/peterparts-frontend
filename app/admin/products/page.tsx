import AdminProductsClient from "@/components/admin/AdminProductsClient";
import {
  getAdminExchangeRate,
  getAdminBrands,
  getAdminCategories,
  getAdminProducts,
} from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, brands, categories, latestExchangeRate] = await Promise.all([
    getAdminProducts(),
    getAdminBrands(),
    getAdminCategories(),
    getAdminExchangeRate(),
  ]);

  return (
    <AdminProductsClient
      initialProducts={products}
      existingBrands={brands}
      existingCategories={categories}
      latestExchangeRate={latestExchangeRate}
    />
  );
}
