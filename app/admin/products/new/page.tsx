import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { Button } from "@/components/ui/button";
import { getAdminManagedCategoryOptions } from "@/lib/admin-categories";
import { getAdminColorSuggestions } from "@/lib/admin-colors";
import {
  getAdminBrands,
  getAdminCategoryLabelSuggestions,
  getAdminExchangeRate,
} from "@/lib/product-data";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const [
    brands,
    managedCategories,
    categoryLabelSuggestions,
    colorSuggestions,
    latestExchangeRate,
  ] = await Promise.all([
    getAdminBrands(),
    getAdminManagedCategoryOptions(),
    getAdminCategoryLabelSuggestions(),
    getAdminColorSuggestions(),
    getAdminExchangeRate(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Nuevo producto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea el producto en una vista dedicada y vuelve al listado cuando termines.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4" />
            Volver al listado
          </Link>
        </Button>
      </div>

      <AdminProductForm
        mode="create"
        existingBrands={brands}
        managedCategories={managedCategories}
        categoryLabelSuggestions={categoryLabelSuggestions}
        colorSuggestions={colorSuggestions}
        latestExchangeRate={latestExchangeRate}
      />
    </div>
  );
}