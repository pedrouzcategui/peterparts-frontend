"use client";

import AdminProductsTableClient from "@/components/admin/AdminProductsTableClient";
import type { AdminExchangeRate, AdminProduct } from "@/lib/admin-data";

interface AdminProductsClientProps {
  initialProducts: AdminProduct[];
  existingBrands?: string[];
  existingCategories?: string[];
  latestExchangeRate: AdminExchangeRate | null;
}

export default function AdminProductsClient({
  initialProducts,
  latestExchangeRate,
}: AdminProductsClientProps) {
  return (
    <AdminProductsTableClient
      initialProducts={initialProducts}
      latestExchangeRate={latestExchangeRate}
    />
  );
}