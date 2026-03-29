import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the individual product detail page.
 * Displays while product data is being fetched.
 */
export default function ProductDetailLoading() {
  return (
    <div className="site-shell py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Product detail layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image gallery skeleton */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="hidden sm:flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-16 rounded-md" />
            ))}
          </div>
          {/* Main image */}
          <div className="flex-1">
            <Skeleton className="aspect-square w-full rounded-lg" />
            {/* Navigation arrows */}
            <div className="mt-4 flex justify-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Product info skeleton */}
        <div className="space-y-6">
          {/* Title and price */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
            <div className="flex items-baseline gap-3 pt-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>

          {/* Reviews */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-12" />
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-md" />
              ))}
            </div>
          </div>

          {/* Add to bag button */}
          <Skeleton className="h-14 w-full rounded-full" />

          {/* Favorite button */}
          <Skeleton className="h-14 w-full rounded-full" />

          {/* Shipping info */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Description */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Features list */}
          <div className="space-y-2 pt-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>

          {/* Accordion sections */}
          <div className="space-y-2 pt-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
