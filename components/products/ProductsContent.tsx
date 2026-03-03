"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Pagination from "@/components/products/Pagination";
import type { Product } from "@/lib/types";

const PRODUCTS_PER_PAGE = 6;

interface ProductsContentProps {
  allProducts: Product[];
}

/**
 * ProductsContent — Client Component
 * Filters products based on URL search params and handles pagination.
 * Includes a simulated delay to demonstrate loading skeleton.
 */
export default function ProductsContent({ allProducts }: ProductsContentProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay to show skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Filter products based on search params
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search query (name or gear ID)
    const query = searchParams.get("q")?.toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.style.toLowerCase().includes(query),
      );
    }

    // Brand filter
    const brands = searchParams.get("brand")?.split(",");
    if (brands?.length) {
      result = result.filter((p) => brands.includes(p.brand));
    }

    // Category filter (subcategory in our data model)
    const categories = searchParams.get("category")?.split(",");
    if (categories?.length) {
      result = result.filter((p) => categories.includes(p.subcategory));
    }

    // Price range filter
    const priceRanges = searchParams.get("price")?.split(",");
    if (priceRanges?.length) {
      result = result.filter((p) => {
        return priceRanges.some((range) => {
          if (range === "0-100") return p.price < 100;
          if (range === "100-300") return p.price >= 100 && p.price < 300;
          if (range === "300-500") return p.price >= 300 && p.price < 500;
          if (range === "500-1000") return p.price >= 500 && p.price < 1000;
          if (range === "1000-up") return p.price >= 1000;
          return true;
        });
      });
    }

    // Sale & Offers filter
    const saleFilters = searchParams.get("sale")?.split(",");
    if (saleFilters?.length) {
      result = result.filter((p) => {
        return saleFilters.some((filter) => {
          if (filter === "sale")
            return p.badge === "Sale" || p.originalPrice !== undefined;
          if (filter === "new") return p.badge === "Just In";
          return true;
        });
      });
    }

    // Color filter
    const colors = searchParams.get("color")?.split(",");
    if (colors?.length) {
      result = result.filter((p) => {
        const productColor = p.color.toLowerCase();
        return colors.some((color) => {
          if (color === "stainless-steel")
            return productColor.includes("stainless");
          if (color === "black") return productColor.includes("black");
          if (color === "red") return productColor.includes("red");
          if (color === "white") return productColor.includes("white");
          if (color === "silver") return productColor.includes("silver");
          return false;
        });
      });
    }

    // Sort
    const sort = searchParams.get("sort");
    if (sort === "price-low-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-high-low") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "top-rated") {
      result.sort((a, b) => b.reviews.rating - a.reviews.rating);
    } else if (sort === "newest") {
      // For demo, just use badge "Just In"
      result.sort((a, b) => {
        const aNew = a.badge === "Just In" ? 1 : 0;
        const bNew = b.badge === "Just In" ? 1 : 0;
        return bNew - aNew;
      });
    }

    return result;
  }, [allProducts, searchParams]);

  // Pagination
  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  if (isLoading) {
    return <ProductsLoadingSkeleton />;
  }

  return (
    <div>
      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {paginatedProducts.length} of {filteredProducts.length} products
        {filteredProducts.length !== allProducts.length && (
          <span> (filtered from {allProducts.length} total)</span>
        )}
      </p>

      <ProductGrid products={paginatedProducts} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}

function ProductsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-card animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square w-full bg-muted" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Brand */}
        <div className="h-3 w-16 bg-muted rounded" />
        {/* Product name */}
        <div className="h-5 w-full bg-muted rounded" />
        <div className="h-5 w-3/4 bg-muted rounded" />
        {/* Price */}
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <div className="h-6 w-20 bg-muted rounded" />
          <div className="h-4 w-14 bg-muted rounded" />
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-4 w-8 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
