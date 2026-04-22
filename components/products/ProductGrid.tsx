import ProductCard from "@/components/products/ProductCard";
import type { Product, ProductCurrency } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  currency: ProductCurrency;
}

/**
 * ProductGrid — Server Component
 * Renders a responsive grid of ProductCard components.
 */
export default function ProductGrid({ products, currency }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">No se encontraron productos</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajusta los filtros o vuelve a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currency={currency} />
      ))}
    </div>
  );
}
