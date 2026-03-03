"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FilterSidebar from "@/components/products/FilterSidebar";
import SearchInput from "@/components/products/SearchInput";
import type { FilterGroup } from "@/lib/types";

interface MobileFilterSheetProps {
  filterGroups: FilterGroup[];
}

/**
 * MobileFilterSheet — Client Component
 * Slide-out filter drawer for mobile viewports.
 */
export default function MobileFilterSheet({
  filterGroups,
}: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <SearchInput />
          <FilterSidebar filterGroups={filterGroups} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
