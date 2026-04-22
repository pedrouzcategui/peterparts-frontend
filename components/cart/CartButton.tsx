"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  className?: string;
  badgeClassName?: string;
  title?: string;
}

export default function CartButton({
  className,
  badgeClassName,
  title,
}: CartButtonProps) {
  const { itemCount } = useCart();
  const cartLabel =
    itemCount > 0
      ? `Carrito de compras con ${itemCount} artículo${itemCount === 1 ? "" : "s"}`
      : "Carrito de compras";
  const tooltipLabel = title ?? cartLabel;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={cartLabel}
          className={cn("relative", className)}
        >
          <Link href="/cart">
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 ? (
              <span
                className={cn(
                  "absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground",
                  badgeClassName,
                )}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}