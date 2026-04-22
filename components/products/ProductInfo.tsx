"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useOptionalCart } from "@/components/providers/CartProvider";
import FavouriteToggleButton from "@/components/products/FavouriteToggleButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCartLineId } from "@/lib/cart";
import MarkdownContent from "@/components/products/MarkdownContent";
import { formatUsd, formatVes } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Product, ProductImage } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
  initiallyFavourited: boolean;
  selectedVariant: string | null;
  onSelectedVariantChange: (variantLabel: string) => void;
  selectedImage: ProductImage | null;
}

/**
 * ProductInfo — Client Component
 * Right-side panel on the PDP: name, price, variant picker, add to bag, etc.
 */
export default function ProductInfo({
  product,
  initiallyFavourited,
  selectedVariant,
  onSelectedVariantChange,
  selectedImage,
}: ProductInfoProps) {
  const cart = useOptionalCart();
  const itemCount = cart?.itemCount ?? 0;
  const items = cart?.items ?? [];

  const activeVariant = product.variants.find(
    (variant) => variant.label === selectedVariant,
  );
  const cartLineIds = [
    getCartLineId(product.databaseId, selectedVariant ?? undefined),
    getCartLineId(product.id, selectedVariant ?? undefined),
  ];
  const quantityInCart =
    items.find((item) => cartLineIds.includes(item.id))?.quantity ?? 0;
  const remainingInventory = Math.max(0, product.stockQuantity - quantityInCart);
  const canAddToBag =
    product.inStock &&
    remainingInventory > 0 &&
    (product.variants.length === 0 || Boolean(activeVariant?.available));
  const priceUsd = product.priceUsd ?? product.price;
  const priceVes = product.priceVes;
  const originalPriceUsd = product.originalPriceUsd ?? product.originalPrice;
  const originalPriceVes = product.originalPriceVes;

  const formattedPrice = formatUsd(priceUsd);
  const formattedOriginalPrice = originalPriceUsd
    ? formatUsd(originalPriceUsd)
    : null;
  const formattedVesPrice =
    typeof priceVes === "number" && priceVes > 0 ? formatVes(priceVes) : null;
  const formattedOriginalVesPrice =
    typeof originalPriceVes === "number" && originalPriceVes > 0
      ? formatVes(originalPriceVes)
      : null;
  const displayedColorLabel = activeVariant?.label ?? product.color;
  const displayedColorValue = activeVariant?.colorValue ?? product.colorValue;
  const roundedReviewRating = Math.round(product.reviews.rating);

  const handleAddToBag = () => {
    cart?.addProduct(
      product,
      selectedVariant ?? undefined,
      1,
      selectedImage ?? undefined,
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Name & Price */}
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">{product.subcategory}</p>
        <div
          className="mt-2 flex items-center gap-1 text-[#f4b321]"
          aria-label={`Calificación promedio de ${product.reviews.rating} sobre 5`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-4 w-4"
              fill={index < roundedReviewRating ? "currentColor" : "none"}
            />
          ))}
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{formattedPrice}</span>
            {formattedOriginalPrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formattedOriginalPrice}
              </span>
            ) : null}
          </div>
          {formattedVesPrice ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Precio en bolívares: {formattedVesPrice}</span>
              {formattedOriginalVesPrice ? (
                <span className="line-through">
                  {formattedOriginalVesPrice}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Variant selector */}
      {product.variants.length > 0 ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Selecciona una opción</h2>
          <div className="grid grid-cols-2 gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.label}
                type="button"
                disabled={!variant.available}
                onClick={() => onSelectedVariantChange(variant.label)}
                className={cn(
                  "rounded-md border px-4 py-3 text-sm transition-colors",
                  variant.available
                    ? "hover:border-foreground cursor-pointer"
                    : "opacity-40 cursor-not-allowed line-through",
                  selectedVariant === variant.label &&
                    "border-foreground ring-1 ring-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: variant.colorValue ?? "#cfd6dc" }}
                    aria-hidden="true"
                  />
                  <span>{variant.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Add to Bag & Favourite */}
      <div className="flex flex-col gap-2 mt-2">
        <Button
          size="lg"
          className="w-full text-base"
          disabled={!canAddToBag}
          onClick={handleAddToBag}
        >
          {!product.inStock
            ? "No disponible por ahora"
            : remainingInventory === 0
              ? "Inventario máximo alcanzado"
              : "Añadir al carrito"}
        </Button>
        <FavouriteToggleButton
          productId={product.databaseId}
          redirectPath={`/products/${product.slug}`}
          initiallyFavourited={initiallyFavourited}
          size="lg"
          className="w-full text-base"
        />
        {itemCount > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {itemCount} artículo{itemCount === 1 ? "" : "s"} en tu carrito.{" "}
            <Link
              href="/cart"
              className="font-medium text-foreground underline underline-offset-2"
            >
              Ver carrito
            </Link>
          </p>
        ) : null}
      </div>

      {/* Shipping info */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Envío</p>
        <p className="text-sm text-muted-foreground">{product.shippingInfo}</p>
        <p className="text-sm font-semibold mt-2">Retiro coordinado</p>
        <button type="button" className="text-sm underline underline-offset-2">
          Ver puntos de entrega
        </button>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <MarkdownContent content={product.description} />
        {displayedColorLabel ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Color mostrado:</span>{" "}
            <span className="inline-flex items-center gap-2">
              {displayedColorValue ? (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10"
                  style={{ backgroundColor: displayedColorValue }}
                  aria-hidden="true"
                />
              ) : null}
              <span>{displayedColorLabel}</span>
            </span>
          </p>
        ) : null}
      </div>

      {/* Brand badge */}
      <div className="mt-2">
        <Badge variant="outline" className="text-xs">
          {product.brand}
        </Badge>
      </div>
    </div>
  );
}
