"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

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
    <div className="flex flex-col gap-4">
      {/* Name & Price */}
      <div>
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-sm text-muted-foreground">{product.subcategory}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-semibold">{formattedPrice}</span>
          {formattedOriginalPrice ? (
            <span className="text-sm text-muted-foreground line-through">
              {formattedOriginalPrice}
            </span>
          ) : null}
        </div>
      </div>

      {/* Variant selector */}
      {product.variants.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold mb-2">
            Select {product.subcategory === "Refrigerators" || product.subcategory === "Ranges & Ovens" ? "Finish" : "Color"}
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
        <Button size="lg" className="w-full text-base">
          Add to Bag
        </Button>
        <Button variant="outline" size="lg" className="w-full text-base">
          Favorite <Heart className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Shipping info */}
      <div className="space-y-1">
        <p className="text-sm font-semibold">Shipping</p>
        <p className="text-sm text-muted-foreground">{product.shippingInfo}</p>
        <p className="text-sm font-semibold mt-2">Free Pickup</p>
        <button type="button" className="text-sm underline underline-offset-2">
          Find a Store
        </button>
      </div>

      <Separator />

      {/* Description */}
      <div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <ul className="mt-3 space-y-1">
          <li className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Shown:</span>{" "}
            {product.color}
          </li>
          <li className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Style:</span>{" "}
            {product.style}
          </li>
        </ul>
      </div>

      {/* Expandable sections */}
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="details">
          <AccordionTrigger className="text-sm font-semibold">
            Product Details
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
            Shipping &amp; Returns
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {product.shippingInfo}. Standard delivery within 3-7 business
              days. Returns accepted within 30 days of delivery. Items must be
              unused and in original packaging.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="reviews">
          <AccordionTrigger className="text-sm font-semibold">
            Reviews ({product.reviews.count})
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
                  Based on {product.reviews.count} reviews
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
