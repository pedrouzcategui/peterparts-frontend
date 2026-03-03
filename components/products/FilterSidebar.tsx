"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
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

  return (
    <aside
      className={`w-full space-y-1 ${isPending ? "opacity-70" : ""}`}
      aria-label="Product filters"
    >
      {filterGroups.map((group) => {
        const isOpen = openSections[group.key] ?? true;
        const selectedValues = getSelectedValues(group.key);

        return (
          <div key={group.key}>
            <button
              type="button"
              className="flex w-full items-center justify-between py-3 text-sm font-semibold hover:text-primary transition-colors"
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
              <div className="pb-3 space-y-2">
                {group.options.map((option) => {
                  const isChecked = selectedValues.includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                      <span>
                        {option.label}
                        {option.count !== undefined ? (
                          <span className="ml-1 text-xs">({option.count})</span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : null}

            <Separator />
          </div>
        );
      })}
    </aside>
  );
}
