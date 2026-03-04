import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the products page.
 * Displays while product data is being fetched.
 */
export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page heading skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 lg:hidden" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="mt-8 flex gap-8">
        {/* Desktop sidebar skeleton - sticky */}
        <div className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto space-y-6">
            {/* Search input skeleton */}
            <Skeleton className="h-10 w-full" />

            {/* Filter group skeletons */}
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

        {/* Product grid skeleton */}
        <div className="flex-1">
          {/* Results count skeleton */}
          <Skeleton className="mb-4 h-5 w-48" />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="mt-8 flex items-center justify-center gap-1">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card">
      {/* Image skeleton */}
      <div className="aspect-square w-full bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Brand */}
        <Skeleton className="h-3 w-16" />
        {/* Product name */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
}
