"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, LoaderCircle } from "lucide-react";
import { toggleFavouriteAction } from "@/app/(main)/favourites/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FavouriteToggleButtonProps {
  productId: string;
  redirectPath: string;
  initiallyFavourited: boolean;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "outline" | "secondary" | "ghost";
  showLabel?: boolean;
}

export default function FavouriteToggleButton({
  productId,
  redirectPath,
  initiallyFavourited,
  className,
  size = "default",
  variant = "outline",
  showLabel = true,
}: FavouriteToggleButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFavourited, setIsFavourited] = useState(initiallyFavourited);

  const label = isFavourited ? "Guardado" : "Guardar";

  const handleClick = () => {
    startTransition(async () => {
      const previousValue = isFavourited;
      setIsFavourited(!previousValue);

      try {
        const result = await toggleFavouriteAction({
          productId,
          redirectPath,
        });

        if (result.status === "unauthenticated") {
          setIsFavourited(previousValue);
          toast.message("Inicia sesion para guardar favoritos.");
          router.push(result.redirectTo);
          return;
        }

        if (result.status === "error") {
          setIsFavourited(previousValue);
          toast.error(result.message);
          return;
        }

        setIsFavourited(result.status === "added");
        toast.success(
          result.status === "added"
            ? `${result.productName} se guardo en favoritos.`
            : `${result.productName} se elimino de favoritos.`,
        );
        router.refresh();
      } catch {
        setIsFavourited(previousValue);
        toast.error("No pudimos actualizar tus favoritos.");
      }
    });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "gap-2",
        isFavourited &&
          variant === "outline" &&
          "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary",
        className,
      )}
      aria-pressed={isFavourited}
      aria-label={label}
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn("h-5 w-5", isFavourited && "fill-current")} />
      )}
      {showLabel ? <span>{label}</span> : null}
    </Button>
  );
}
