import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the products page.
 * Displays while product data is being fetched.
 */
export default function ProductsLoading() {
  return (
    <div className="site-shell py-8 lg:py-10">
      {/* Page heading skeleton */}
      <div className="flex flex-col gap-5 border-b border-[#ebe7e0] pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-border">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-24 lg:hidden" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className="mt-8 flex gap-8 xl:gap-10">
        {/* Desktop sidebar skeleton - sticky */}
        <div className="hidden lg:block w-68 shrink-0 xl:w-72">
          <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto px-2 pb-4 pr-3 pt-2">
            {/* Search input skeleton */}
            <div className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] px-5 py-4 shadow-[0_10px_28px_rgba(26,23,20,0.05)] dark:border-border dark:bg-card dark:shadow-none">
              <Skeleton className="h-10 w-full" />
              <div className="mt-5 grid grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-10 rounded-full" />
                ))}
              </div>

              <div className="mt-6 space-y-6">
                {Array.from({ length: 4 }).map((_, groupIndex) => (
                  <div key={groupIndex} className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="flex-1">
          {/* Results count skeleton */}
          <Skeleton className="mb-4 h-5 w-48" />

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
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
    <div className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#ebe7e0] bg-white dark:border-border dark:bg-card">
      {/* Image skeleton */}
      <div className="aspect-square w-full bg-[#fcfaf7]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-3 bg-[#f5f3ef] p-6 dark:bg-card">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-full" />
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, swatchIndex) => (
            <Skeleton key={swatchIndex} className="h-5 w-5 rounded-full" />
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}
