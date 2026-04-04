"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MarkdownContent from "@/components/products/MarkdownContent";
import { formatUsd, formatVes } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductInfoProps {
  product: Product;
}

/**
 * ProductInfo — Client Component
 * Right-side panel on the PDP: name, price, variant picker, add to bag, etc.
 */
export default function ProductInfo({ product }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product.variants.find((variant) => variant.available)?.label ?? null,
  );
  const { addProduct, itemCount } = useCart();

  const activeVariant = product.variants.find(
    (variant) => variant.label === selectedVariant,
  );
  const canAddToBag =
    product.inStock &&
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

  const handleAddToBag = () => {
    addProduct(product, selectedVariant ?? undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Name & Price */}
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">{product.subcategory}</p>
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
              <span>Precio en bolivares: {formattedVesPrice}</span>
              {formattedOriginalVesPrice ? (
                <span className="line-through">{formattedOriginalVesPrice}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Variant selector */}
      {product.variants.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            Selecciona {[
              "Refrigerators",
              "Ranges & Ovens",
              "Refrigeradores",
              "Cocinas y hornos",
            ].includes(product.subcategory)
              ? "acabado"
              : "color"}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.label}
                type="button"
                disabled={!variant.available}
                onClick={() => setSelectedVariant(variant.label)}
                className={cn(
                  "rounded-md border px-4 py-3 text-sm transition-colors",
                  variant.available
                    ? "hover:border-foreground cursor-pointer"
                    : "opacity-40 cursor-not-allowed line-through",
                  selectedVariant === variant.label &&
                    "border-foreground ring-1 ring-foreground"
                )}
              >
                {variant.label}
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
          {product.inStock ? "Anadir al carrito" : "No disponible por ahora"}
        </Button>
        <Button variant="outline" size="lg" className="w-full text-base">
          Guardar <Heart className="ml-2 h-5 w-5" />
        </Button>
        {itemCount > 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            {itemCount} articulo{itemCount === 1 ? "" : "s"} en tu carrito. {" "}
            <Link href="/cart" className="font-medium text-foreground underline underline-offset-2">
              Ver carrito
            </Link>
          </p>
        ) : null}
      </div>

      {/* Shipping info */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Envio</p>
        <p className="text-sm text-muted-foreground">{product.shippingInfo}</p>
        <p className="text-sm font-semibold mt-2">Retiro gratis</p>
        <button type="button" className="text-sm underline underline-offset-2">
          Buscar una tienda
        </button>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <MarkdownContent content={product.description} />
        <ul className="mt-3 space-y-1">
          <li className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Color mostrado:</span>{" "}
            {product.color}
          </li>
          <li className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Modelo:</span>{" "}
            {product.style}
          </li>
        </ul>
      </div>

      {/* Expandable sections */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm font-semibold">
            Detalles del producto
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-1.5">
              {product.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground" />
                  {feature}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shipping">
          <AccordionTrigger className="text-sm font-semibold">
            Envio y devoluciones
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {product.shippingInfo}. La entrega estandar tarda entre 3 y 7 dias
              habiles. Se aceptan devoluciones dentro de los 30 dias posteriores
              a la entrega. Los articulos deben estar sin usar y en su empaque original.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reviews">
          <AccordionTrigger className="text-sm font-semibold">
            Resenas ({product.reviews.count})
            <span className="ml-auto mr-2 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-xs",
                    i < Math.round(product.reviews.rating)
                      ? "text-foreground"
                      : "text-muted-foreground/30"
                  )}
                >
                  ★
                </span>
              ))}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {product.reviews.rating}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "text-sm",
                        i < Math.round(product.reviews.rating)
                          ? "text-foreground"
                          : "text-muted-foreground/30"
                      )}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en {product.reviews.count} resenas
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Brand badge */}
      <div className="mt-2">
        <Badge variant="outline" className="text-xs">
          {product.brand}
        </Badge>
      </div>
    </div>
  );
}
