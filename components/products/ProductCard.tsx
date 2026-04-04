import Link from "next/link";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductCardQuickAdd from "./ProductCardQuickAdd";
import ProductImageWithFallback from "@/components/products/ProductImageWithFallback";
import { formatUsd, formatVes } from "@/lib/currency";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

const COLOR_SWATCH_STYLES: Array<{ match: RegExp; className: string }> = [
  { match: /red|empire|beet|burgundy/i, className: "bg-[#c61c31]" },
  { match: /black|onyx|ink/i, className: "bg-[#1A1714]" },
  { match: /white|milk|porcelain/i, className: "bg-white" },
  { match: /silver|stainless|chrome/i, className: "bg-[#d5d7db]" },
  { match: /blue|ice|sky|aqua/i, className: "bg-[#bfdde5]" },
  { match: /green|sage|pistachio/i, className: "bg-[#9aa78f]" },
  { match: /pink|lavender|lilac|rose/i, className: "bg-[#d8bfd3]" },
  { match: /yellow|gold/i, className: "bg-[#e6c84f]" },
  { match: /orange|copper/i, className: "bg-[#c97a35]" },
];

function getSwatchClass(label: string) {
  const match = COLOR_SWATCH_STYLES.find((entry) => entry.match.test(label));
  return match?.className ?? "bg-[#cfd6dc]";
}

/**
 * ProductCard — Server Component
 * Renders a single product in the grid listing.
 * Designed for SEO: uses semantic markup, alt text, and structured headings.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const priceUsd = product.priceUsd ?? product.price;
  const priceVes = product.priceVes;
  const originalPriceUsd = product.originalPriceUsd ?? product.originalPrice;
  const formattedPrice = formatUsd(priceUsd);

  const formattedOriginalPrice = originalPriceUsd
    ? formatUsd(originalPriceUsd)
    : null;
  const formattedVesPrice =
    typeof priceVes === "number" && priceVes > 0 ? formatVes(priceVes) : null;

  const shortDescription = product.description.slice(0, 120).trim();
  const showEllipsis = product.description.length > 120;
  const rating = product.reviews.rating.toFixed(1);
  const savings = originalPriceUsd
    ? formatUsd(originalPriceUsd - priceUsd)
    : null;
  const swatchLabels = Array.from(
    new Set(
      [
        product.color,
        ...product.variants.map((variant) => variant.label),
      ].filter(Boolean),
    ),
  ).slice(0, 5);
  const extraSwatches = Math.max(
    0,
    Array.from(
      new Set(
        [
          product.color,
          ...product.variants.map((variant) => variant.label),
        ].filter(Boolean),
      ),
    ).length - swatchLabels.length,
  );
  const badgeLabel =
    product.badge === "Sale"
      ? "Oferta"
      : product.badge === "Just In"
        ? "Recien llegado"
        : product.badge === "Best Seller"
          ? "Mas vendido"
          : product.badge;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full"
      aria-label={`Ver ${product.name}`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#ebe7e0] bg-white shadow-[0_18px_48px_rgba(26,23,20,0.08)] transition-transform duration-300 hover:-translate-y-1 dark:border-border dark:bg-card dark:shadow-none">
        {/* Image container */}
        <div className="relative aspect-[1.02] overflow-hidden border-b border-[#ebe7e0] bg-[#fcfaf7] px-6 pb-5 pt-16 dark:border-border dark:bg-muted/30">
          {badgeLabel ? (
            <div className="absolute left-4 top-4 z-10 flex items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/5 dark:bg-card">
              <span className="bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                {originalPriceUsd
                  ? `-${Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)}%`
                  : badgeLabel}
              </span>
              <span className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary dark:text-primary">
                {badgeLabel}
              </span>
            </div>
          ) : null}

          <ProductImageWithFallback
            src={product.images[0]?.src}
            alt={product.images[0]?.alt ?? product.name}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col bg-[#f5f3ef] px-6 pb-6 pt-5 dark:bg-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {product.subcategory}
              </p>
              <h3 className="mt-2 text-[1.05rem] font-semibold uppercase leading-snug tracking-tight text-[#1A1714] line-clamp-3 dark:text-foreground">
                {product.name}
              </h3>
            </div>
            {product.badge &&
            product.badge !== "Sale" &&
            product.badge !== "Oferta" ? (
              <Badge
                variant="secondary"
                className="shrink-0 bg-white text-[#630E19] dark:bg-muted dark:text-foreground"
              >
                {product.badge}
              </Badge>
            ) : null}
          </div>

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {shortDescription}
            {showEllipsis ? "..." : ""}
          </p>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#1A1714] dark:text-foreground">
            <div className="flex items-center gap-0.5 text-[#f4b321]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-4 w-4"
                  fill={
                    index < Math.round(product.reviews.rating)
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">
              ({product.reviews.count})
            </span>
            {product.style ? (
              <span className="ml-auto text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {product.style}
              </span>
            ) : null}
          </div>

          {swatchLabels.length > 0 ? (
            <div className="mt-4 flex items-center gap-2">
              {swatchLabels.map((label) => (
                <span
                  key={label}
                  title={label}
                  className={`h-5 w-5 rounded-full border border-black/10 shadow-sm ${getSwatchClass(label)}`}
                />
              ))}
              {extraSwatches > 0 ? (
                <span className="text-sm font-medium text-muted-foreground">
                  +{extraSwatches}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[1.7rem] font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
                  {formattedPrice}
                </span>
                {formattedOriginalPrice ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {formattedOriginalPrice}
                  </span>
                ) : null}
              </div>
              {formattedVesPrice ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Precio en bolivares: {formattedVesPrice}
                </p>
              ) : null}

              {savings ? (
                <p className="mt-1 text-sm font-medium text-[#2f8a42] dark:text-green-400">
                  Ahorra {savings}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.inStock
                    ? "Listo para enviar"
                    : "No disponible por ahora"}
                </p>
              )}
            </div>

            {product.inStock ? <ProductCardQuickAdd product={product} /> : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
