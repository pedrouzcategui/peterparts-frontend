import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

/**
 * ProductCard — Server Component
 * Renders a single product in the grid listing.
 * Designed for SEO: uses semantic markup, alt text, and structured headings.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.originalPrice)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      aria-label={`View ${product.name}`}
    >
      <article className="flex flex-col">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
          <Image
            src={product.images[0]?.src ?? "/images/placeholder.jpg"}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Details */}
        <div className="mt-3 space-y-1">
          {product.badge ? (
            <Badge
              variant={product.badge === "Sale" ? "destructive" : "secondary"}
              className="mb-1 text-xs"
            >
              {product.badge}
            </Badge>
          ) : null}

          <h3 className="text-sm font-medium leading-snug line-clamp-2">
            {product.name}
          </h3>

          <p className="text-xs text-muted-foreground">{product.subcategory}</p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formattedPrice}</span>
            {formattedOriginalPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formattedOriginalPrice}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
