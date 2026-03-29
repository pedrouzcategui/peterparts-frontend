"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, type ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * SearchInput — Client Component
 * Search box for filtering products by name or gear ID.
 */
export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  const updateSearch = useCallback(
    (newValue: string) => {
      setValue(newValue);
      const params = new URLSearchParams(searchParams.toString());

      if (newValue) {
        params.set("q", newValue);
      } else {
        params.delete("q");
      }
      // Reset to page 1 when searching
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSearch(e.target.value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar por nombre o SKU"
        value={value}
        onChange={handleChange}
        className={`pl-9 ${isPending ? "opacity-70" : ""}`}
      />
    </div>
  );
}
