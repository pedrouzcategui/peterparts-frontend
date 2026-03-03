import { Suspense } from "react";
import type { Metadata } from "next";
import { products, filterGroups } from "@/lib/data";
import FilterSidebar from "@/components/products/FilterSidebar";
import SortDropdown from "@/components/products/SortDropdown";
import MobileFilterSheet from "@/components/products/MobileFilterSheet";
import SearchInput from "@/components/products/SearchInput";
import ProductsContent from "@/components/products/ProductsContent";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Kitchen Appliances & Gear | PeterParts",
  description:
    "Browse premium kitchen appliances from Cuisinart, Whirlpool, and KitchenAid. Shop food processors, stand mixers, refrigerators, and more at PeterParts.",
  openGraph: {
    title: "Kitchen Appliances & Gear | PeterParts",
    description:
      "Browse premium kitchen appliances from Cuisinart, Whirlpool, and KitchenAid.",
    type: "website",
  },
};

/**
 * /products — Server Component
 * Product listing page with sidebar filters and a responsive grid.
 * Data is loaded server-side for SEO.
 */
export default function ProductsPage() {
  const totalProducts = products.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">
          Kitchen Appliances &amp; Gear ({totalProducts})
        </h1>
        <div className="flex items-center gap-3">
          <Suspense fallback={<Skeleton className="h-10 w-24 lg:hidden" />}>
            <MobileFilterSheet filterGroups={filterGroups} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-10 w-[180px]" />}>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="mt-8 flex gap-8">
        {/* Desktop sidebar - sticky */}
        <div className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
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
            <ProductsContent allProducts={products} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function FilterSidebarSkeleton() {
  return (
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
  );
}

function ProductsContentSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <div
          key={index}
          className="group relative flex flex-col overflow-hidden rounded-lg border bg-card animate-pulse"
        >
          <div className="aspect-square w-full bg-muted" />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-5 w-full bg-muted rounded" />
            <div className="h-5 w-3/4 bg-muted rounded" />
            <div className="mt-auto flex items-baseline gap-2 pt-2">
              <div className="h-6 w-20 bg-muted rounded" />
              <div className="h-4 w-14 bg-muted rounded" />
            </div>
            <div className="flex items-center gap-1">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-8 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
