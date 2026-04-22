"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { getBrandQueryValue } from "@/lib/brand-slugs";
import { cn } from "@/lib/utils";
import type { FilterGroup } from "@/lib/types";

interface FilterSidebarProps {
  filterGroups: FilterGroup[];
}

/**
 * FilterSidebar — Client Component
 * Collapsible filter sections with checkboxes, matching the Nike-style sidebar.
 * Checkboxes are connected to URL search params for filtering.
 */
export default function FilterSidebar({ filterGroups }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const normalizeFilterValue = useCallback(
    (groupKey: string, value: string) => {
      if (groupKey === "brand") {
        return getBrandQueryValue(value);
      }

      return value;
    },
    [],
  );

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
      return param
        ? Array.from(
            new Set(
              param
                .split(",")
                .map((value) => normalizeFilterValue(groupKey, value)),
            ),
          )
        : [];
    },
    [normalizeFilterValue, searchParams],
  );

  // Toggle a filter value in URL params
  const toggleFilter = useCallback(
    (groupKey: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentValues = getSelectedValues(groupKey);
      const normalizedValue = normalizeFilterValue(groupKey, value);

      let newValues: string[];
      if (checked) {
        newValues = Array.from(new Set([...currentValues, normalizedValue]));
      } else {
        newValues = currentValues.filter(
          (currentValue) => currentValue !== normalizedValue,
        );
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
    [getSelectedValues, normalizeFilterValue, router, searchParams],
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
                  <div className="flex flex-wrap gap-3">
                    {group.options.map((option) => {
                      const isChecked = selectedValues.includes(option.value);
                      const optionLabel =
                        option.count !== undefined
                          ? `${option.label} (${option.count})`
                          : option.label;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={cn(
                            "group relative flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-transparent transition-all hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7] dark:focus-visible:ring-offset-card",
                            isChecked &&
                              "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(217,30,54,0.12)]",
                          )}
                          onClick={() =>
                            toggleFilter(group.key, option.value, !isChecked)
                          }
                          aria-pressed={isChecked}
                          aria-label={optionLabel}
                        >
                          <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1a1714] px-2.5 py-1 text-[11px] font-medium leading-none text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 dark:bg-white dark:text-[#1a1714]">
                            {option.label}
                          </span>
                          <span
                            className={cn(
                              "h-6 w-6 rounded-full border border-black/10 shadow-sm dark:border-white/70",
                              isChecked && "ring-2 ring-primary/60 ring-offset-2",
                            )}
                            style={{
                              backgroundColor: option.swatchValue ?? "#cfd6dc",
                            }}
                            aria-hidden="true"
                          />
                          <span className="sr-only">{optionLabel}</span>
                          {option.count !== undefined ? (
                            <span className="absolute -bottom-1 -right-1 min-w-5 rounded-full bg-[#fbfaf7] px-1 text-center text-[10px] font-medium leading-5 text-muted-foreground shadow-sm dark:bg-card">
                              {option.count}
                            </span>
                          ) : null}
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
