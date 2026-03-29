import { Suspense } from "react";
import type { Metadata } from "next";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortDropdown from "@/components/products/SortDropdown";
import MobileFilterSheet from "@/components/products/MobileFilterSheet";
import SearchInput from "@/components/products/SearchInput";
import ProductsContent from "@/components/products/ProductsContent";
import { Skeleton } from "@/components/ui/skeleton";
import { getFilterGroups, getProducts } from "@/lib/product-data";

export const metadata: Metadata = {
  title: "Electrodomesticos y accesorios de cocina | PeterParts",
  description:
    "Explora electrodomesticos de cocina premium de Cuisinart, Whirlpool y KitchenAid. Compra procesadores de alimentos, batidoras de pedestal, refrigeradores y mas en PeterParts.",
  openGraph: {
    title: "Electrodomesticos y accesorios de cocina | PeterParts",
    description:
      "Explora electrodomesticos de cocina premium de Cuisinart, Whirlpool y KitchenAid.",
    type: "website",
  },
};

/**
 * /products — Server Component
 * Product listing page with sidebar filters and a responsive grid.
 * Data is loaded server-side for SEO.
 */
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const allProducts = await getProducts();
  const filterGroups = await getFilterGroups();
  const totalProducts = allProducts.length;

  return (
    <div className="site-shell py-8 lg:py-10">
      {/* Page heading */}
      <div className="flex flex-col gap-5 border-b border-[#ebe7e0] pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-border">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Catalogo PeterParts
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1A1714] dark:text-foreground">
            Electrodomesticos y accesorios ({totalProducts})
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Explora electrodomesticos especializados de marcas confiables, con filtros por acabado, categoria, precio y ofertas vigentes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<Skeleton className="h-10 w-24 lg:hidden" />}>
            <MobileFilterSheet filterGroups={filterGroups} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-45" />}>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="mt-8 flex gap-8 xl:gap-10">
        {/* Desktop sidebar - sticky */}
        <div className="hidden lg:block w-68 shrink-0 xl:w-72">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto px-2 pb-4 pr-3 pt-2">
            {/* Search input */}
            <div className="mb-4">
              <Suspense fallback={<Skeleton className="h-10 w-full" />}>
                <SearchInput />
              </Suspense>
            </div>
            <Suspense fallback={<FilterSidebarSkeleton />}>
              <FilterSidebar filterGroups={filterGroups} />
            </Suspense>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductsContentSkeleton />}>
            <ProductsContent allProducts={allProducts} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FilterSidebarSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] px-5 py-4 shadow-[0_10px_28px_rgba(26,23,20,0.05)] dark:border-border dark:bg-card dark:shadow-none">
      <div className="mb-5 grid grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-10 rounded-full" />
        ))}
      </div>

      <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

function ProductsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#ebe7e0] bg-white animate-pulse dark:border-border dark:bg-card"
        >
          <div className="aspect-square w-full bg-[#fcfaf7]" />
          <div className="flex flex-1 flex-col gap-3 bg-[#f5f3ef] p-6 dark:bg-card">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-7 w-full rounded bg-muted" />
            <div className="h-7 w-4/5 rounded bg-muted" />
            <div className="h-18 w-full rounded bg-muted" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, swatchIndex) => (
                <div key={swatchIndex} className="h-5 w-5 rounded-full bg-muted" />
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between pt-3">
              <div className="space-y-2">
                <div className="h-8 w-24 rounded bg-muted" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="h-11 w-11 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
