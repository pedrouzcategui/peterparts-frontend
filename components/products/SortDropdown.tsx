"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SORT_OPTIONS = [
  { label: "Destacados", value: "featured" },
  { label: "Mas recientes", value: "newest" },
  { label: "Precio: menor a mayor", value: "price-low-high" },
  { label: "Precio: mayor a menor", value: "price-high-low" },
  { label: "Mejor valorados", value: "top-rated" },
] as const;

/**
 * SortDropdown — Client Component
 * Lets users sort the product list using URL search params.
 */
export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") || "featured";

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "featured") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
      // Reset to page 1 when sorting changes
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  return (
    <div className={`flex items-center gap-2 ${isPending ? "opacity-70" : ""}`}>
      <span className="text-sm font-medium whitespace-nowrap">Ordenar por</span>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
