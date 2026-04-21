"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ProductGrid from "@/components/products/ProductGrid";
import Pagination from "@/components/products/Pagination";
import { getBrandQueryValue } from "@/lib/brand-slugs";
import { buildProductColorFilterValue } from "@/lib/product-colors";
import type { Product } from "@/lib/types";

const PRODUCTS_PER_PAGE = 6;

interface ProductsContentProps {
  allProducts: Product[];
}

/**
 * ProductsContent — Client Component
 * Filters products based on URL search params and handles pagination.
 */
export default function ProductsContent({ allProducts }: ProductsContentProps) {
  const searchParams = useSearchParams();

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
    const brands = searchParams
      .get("brand")
      ?.split(",")
      .map((brand) => getBrandQueryValue(brand));
    if (brands?.length) {
      result = result.filter((product) =>
        brands.includes(getBrandQueryValue(product.brand)),
      );
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
            return (
              p.badge === "Sale" ||
              p.badge === "Oferta" ||
              p.originalPrice !== undefined
            );
          if (filter === "new") {
            return p.badge === "Just In" || p.badge === "Recien llegado";
          }
          return true;
        });
      });
    }

    // Color filter
    const colors = searchParams.get("color")?.split(",");
    if (colors?.length) {
      result = result.filter((p) => {
        const productColors = new Set(
          [
            p.color,
            ...p.variants.map((variant) => variant.label),
          ]
            .filter(Boolean)
            .map((color) => buildProductColorFilterValue(color)),
        );

        return colors.some((color) => productColors.has(color));
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
      result.sort((a, b) => {
        const aNew = a.badge === "Just In" || a.badge === "Recien llegado" ? 1 : 0;
        const bNew = b.badge === "Just In" || b.badge === "Recien llegado" ? 1 : 0;
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

  return (
    <div>
      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Mostrando {paginatedProducts.length} de {filteredProducts.length} productos
        {filteredProducts.length !== allProducts.length && (
          <span> (filtrados de {allProducts.length} en total)</span>
        )}
      </p>

      <ProductGrid products={paginatedProducts} />
      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
