"use client";

import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/types";

interface ProductCardQuickAddProps {
  product: Product;
}

export default function ProductCardQuickAdd({
  product,
}: ProductCardQuickAddProps) {
  const { addProduct } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const defaultVariant = product.variants.find((variant) => variant.available)?.label;
    addProduct(product, defaultVariant);
    setJustAdded(true);

    window.setTimeout(() => {
      setJustAdded(false);
    }, 1400);
  };

  return (
    <Button
      type="button"
      size="icon"
      className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-[#630E19]"
      aria-label={justAdded ? `${product.name} anadido al carrito` : `Anadir ${product.name} al carrito`}
      onClick={handleAdd}
    >
      <ShoppingBag className="h-4 w-4" />
    </Button>
  );
}