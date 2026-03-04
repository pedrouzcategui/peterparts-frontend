import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ThreadLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link skeleton */}
      <Skeleton className="h-4 w-28 mb-4" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Thread card skeleton */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote skeleton */}
                <div className="flex flex-col items-center gap-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-7 w-3/4 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-7 w-28" />
                    <Skeleton className="h-7 w-20" />
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comment input skeleton */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-24 w-full mb-2" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-24" />
              </div>
            </CardContent>
          </Card>

          {/* Comments skeleton */}
          <Skeleton className="h-5 w-24 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-full ml-8 mb-1" />
                <Skeleton className="h-4 w-3/4 ml-8 mb-2" />
                <div className="flex gap-3 ml-8">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-16 mb-3" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
