"use client";

import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductImageWithFallback from "@/components/products/ProductImageWithFallback";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedImageSrc: string | null;
  onSelectImageSrc: (imageSrc: string) => void;
}

/**
 * ProductImageGallery — Client Component
 * Thumbnail strip on the left, large main image on the right.
 * Mirrors the Nike PDP image gallery layout.
 */
export default function ProductImageGallery({
  images,
  productName,
  selectedImageSrc,
  onSelectImageSrc,
}: ProductImageGalleryProps) {
  const selectedIndex = Math.max(
    0,
    images.findIndex((image) => image.src === selectedImageSrc),
  );
  const selectedImage = images[selectedIndex] ?? images[0];

  const handlePrev = () => {
    if (images.length === 0) {
      return;
    }

    const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    const nextImage = images[nextIndex];

    if (nextImage) {
      onSelectImageSrc(nextImage.src);
    }
  };

  const handleNext = () => {
    if (images.length === 0) {
      return;
    }

    const nextIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    const nextImage = images[nextIndex];

    if (nextImage) {
      onSelectImageSrc(nextImage.src);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => onSelectImageSrc(image.src)}
            className={cn(
              "relative aspect-square w-16 overflow-hidden rounded border-2 transition-colors",
              index === selectedIndex
                ? "border-foreground"
                : "border-transparent hover:border-muted-foreground/40"
            )}
            aria-label={`Ver imagen ${index + 1} de ${images.length}`}
          >
            <ProductImageWithFallback
              src={image.src}
              alt={image.alt}
              sizes="64px"
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square overflow-hidden rounded-lg bg-white dark:bg-white">
        <ProductImageWithFallback
          src={selectedImage?.src}
          alt={selectedImage?.alt ?? productName}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />

        {/* Navigation arrows */}
        {images.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handlePrev}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handleNext}
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
