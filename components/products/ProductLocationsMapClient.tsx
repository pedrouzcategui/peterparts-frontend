"use client";

import dynamic from "next/dynamic";
import type { StorefrontPickupLocation } from "@/lib/storefront-settings";

const ProductLocationsMap = dynamic(
  () => import("@/components/products/ProductLocationsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-88 items-center justify-center rounded-[1.75rem] border border-dashed border-[#d8cfc3] bg-[#f6f0e8] text-sm text-muted-foreground md:h-112 dark:border-border dark:bg-card">
        Cargando mapa de entregas...
      </div>
    ),
  },
);

export default function ProductLocationsMapClient({
  locations,
}: {
  locations: StorefrontPickupLocation[];
}) {
  return <ProductLocationsMap locations={locations} />;
}
