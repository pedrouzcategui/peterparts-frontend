"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FilterGroup } from "@/lib/types";

interface FilterSidebarProps {
  filterGroups: FilterGroup[];
}

const COLOR_SWATCHES: Record<string, string> = {
  "stainless-steel": "bg-[#d8dadd]",
  black: "bg-[#1A1714]",
  red: "bg-[#D91E36]",
  white: "bg-white",
  silver: "bg-[#bdc4ce]",
};

/**
 * FilterSidebar — Client Component
 * Collapsible filter sections with checkboxes, matching the Nike-style sidebar.
 * Checkboxes are connected to URL search params for filtering.
 */
export default function FilterSidebar({ filterGroups }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const group of filterGroups) {
        initial[group.key] = true; // all open by default
      }
      return initial;
    },
  );

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Get selected values for a filter group from URL params
  const getSelectedValues = useCallback(
    (groupKey: string): string[] => {
      const param = searchParams.get(groupKey);
      return param ? param.split(",") : [];
    },
    [searchParams],
  );

  // Toggle a filter value in URL params
  const toggleFilter = useCallback(
    (groupKey: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = getSelectedValues(groupKey);

      let newValues: string[];
      if (checked) {
        newValues = [...currentValues, value];
      } else {
        newValues = currentValues.filter((v) => v !== value);
      }

      if (newValues.length > 0) {
        params.set(groupKey, newValues.join(","));
      } else {
        params.delete(groupKey);
      }

      // Reset to page 1 when filtering
      params.delete("page");

      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams, getSelectedValues],
  );

  const sortedGroups = [...filterGroups].sort((left, right) => {
    if (left.key === "color") return -1;
    if (right.key === "color") return 1;
    return 0;
  });

  return (
    <aside
      className={cn(
        "w-full space-y-1 rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] px-5 py-4 shadow-[0_10px_28px_rgba(26,23,20,0.05)] dark:border-border dark:bg-card dark:shadow-none",
        isPending && "opacity-70",
      )}
      aria-label="Filtros de productos"
    >
      {sortedGroups.map((group) => {
        const isOpen = openSections[group.key] ?? true;
        const selectedValues = getSelectedValues(group.key);

        return (
          <div key={group.key}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold tracking-tight transition-colors hover:text-primary"
              onClick={() => toggleSection(group.key)}
              aria-expanded={isOpen}
            >
              {group.name}
              {selectedValues.length > 0 && (
                <span className="ml-1 text-xs text-primary">
                  ({selectedValues.length})
                </span>
              )}
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isOpen ? (
              <div className="pb-4">
                {group.key === "color" ? (
                  <div className="grid grid-cols-5 gap-3">
                    {group.options.map((option) => {
                      const isChecked = selectedValues.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          title={`${option.label}${option.count !== undefined ? ` (${option.count})` : ""}`}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-white transition-all hover:scale-105 dark:bg-card",
                            isChecked && "ring-2 ring-primary ring-offset-2 ring-offset-[#fbfaf7] dark:ring-offset-card",
                          )}
                          onClick={() =>
                            toggleFilter(
                              group.key,
                              option.value,
                              !isChecked,
                            )
                          }
                          aria-pressed={isChecked}
                          aria-label={option.label}
                        >
                          <span
                            className={cn(
                              "h-5 w-5 rounded-full border border-black/10 shadow-sm",
                              COLOR_SWATCHES[option.value] ?? "bg-[#cfd6dc]",
                            )}
                          />
                          <span className="sr-only">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.options.map((option) => {
                      const isChecked = selectedValues.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Checkbox
                            id={`${group.key}-${option.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              toggleFilter(
                                group.key,
                                option.value,
                                Boolean(checked),
                              )
                            }
                          />
                          <span className="flex flex-1 items-center justify-between gap-3">
                            <span>{option.label}</span>
                            {option.count !== undefined ? (
                              <span className="text-xs">({option.count})</span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            <Separator className="bg-[#e8e2d7] dark:bg-border" />
          </div>
        );
      })}
    </aside>
  );
}
