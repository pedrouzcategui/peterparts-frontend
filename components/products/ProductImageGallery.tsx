"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

/**
 * ProductImageGallery — Client Component
 * Thumbnail strip on the left, large main image on the right.
 * Mirrors the Nike PDP image gallery layout.
 */
export default function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] ?? images[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "relative aspect-square w-16 overflow-hidden rounded border-2 transition-colors",
              index === selectedIndex
                ? "border-foreground"
                : "border-transparent hover:border-muted-foreground/40"
            )}
            aria-label={`View image ${index + 1} of ${images.length}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative flex-1 aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={selectedImage?.src ?? "/images/placeholder.jpg"}
          alt={selectedImage?.alt ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
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
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
