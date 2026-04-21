import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import AdminProductForm from "@/components/admin/AdminProductForm";
import { Button } from "@/components/ui/button";
import type { AdminManagedCategoryOption } from "@/lib/admin-data";
import { getAdminManagedCategoryOptions } from "@/lib/admin-categories";
import { getAdminColorSuggestions } from "@/lib/admin-colors";
import {
  getAdminBrands,
  getAdminCategoryLabelSuggestions,
  getAdminExchangeRate,
  getAdminProductById,
} from "@/lib/product-data";

export const dynamic = "force-dynamic";

function ensureCurrentCategoryOption(
  managedCategories: AdminManagedCategoryOption[],
  product: NonNullable<Awaited<ReturnType<typeof getAdminProductById>>>,
) {
  if (managedCategories.some((category) => category.id === product.primaryCategoryId)) {
    return managedCategories;
  }

  return [
    ...managedCategories,
    {
      id: product.primaryCategoryId,
      name: product.primaryCategoryName,
      slug: product.primaryCategoryName,
      displayName: `${product.primaryCategoryName} (existente)`,
    },
  ].sort((left, right) => left.displayName.localeCompare(right.displayName, "es"));
}

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = (await params).productId;
  const [
    product,
    brands,
    managedCategories,
    categoryLabelSuggestions,
    colorSuggestions,
    latestExchangeRate,
  ] = await Promise.all([
    getAdminProductById(productId),
    getAdminBrands(),
    getAdminManagedCategoryOptions(),
    getAdminCategoryLabelSuggestions(),
    getAdminColorSuggestions(),
    getAdminExchangeRate(),
  ]);

  if (!product) {
    notFound();
  }

  const categoryOptions = ensureCurrentCategoryOption(managedCategories, product);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Editar producto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ajusta la informacion del producto en una vista separada del inventario.
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
        mode="edit"
        initialProduct={product}
        existingBrands={brands}
        managedCategories={categoryOptions}
        categoryLabelSuggestions={categoryLabelSuggestions}
        colorSuggestions={colorSuggestions}
        latestExchangeRate={latestExchangeRate}
      />
    </div>
  );
}