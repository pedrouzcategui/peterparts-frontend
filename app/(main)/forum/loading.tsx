import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function ThreadCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Vote skeleton */}
          <div className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
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
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForumLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Search skeleton */}
          <Skeleton className="h-10 w-full mb-4" />

          {/* Thread list skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <ThreadCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="w-full lg:w-80 shrink-0">
          <SidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
