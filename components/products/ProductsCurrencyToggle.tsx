"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductCurrency } from "@/lib/types";

const CURRENCY_OPTIONS: Array<{
  label: string;
  value: ProductCurrency;
}> = [
  { label: "USD", value: "usd" },
  { label: "VES", value: "ves" },
];

export default function ProductsCurrencyToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCurrency: ProductCurrency =
    searchParams.get("currency") === "ves" ? "ves" : "usd";

  const handleCurrencyChange = useCallback(
    (value: ProductCurrency) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === "usd") {
        params.delete("currency");
      } else {
        params.set("currency", value);
      }

      const query = params.toString();

      startTransition(() => {
        router.push(query ? `/products?${query}` : "/products", {
          scroll: false,
        });
      });
    },
    [router, searchParams],
  );

  return (
    <div className={cn("flex items-center gap-2", isPending && "opacity-70")}>
      <span className="text-sm font-medium whitespace-nowrap">
        Ver precios en
      </span>
      <div className="inline-flex rounded-full border border-[#ded8cf] bg-white p-1 shadow-xs dark:border-border dark:bg-card">
        {CURRENCY_OPTIONS.map((option) => {
          const isActive = option.value === currentCurrency;

          return (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={isActive ? "default" : "ghost"}
              className="rounded-full px-3"
              aria-pressed={isActive}
              onClick={() => handleCurrencyChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}