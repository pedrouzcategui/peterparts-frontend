"use client";

import { useState } from "react";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import {
  getDefaultSelectedVariantLabel,
  getPrimaryProductImage,
  getVisibleProductImages,
} from "@/lib/product-gallery";
import type { Product } from "@/lib/types";

interface ProductDetailClientProps {
  product: Product;
  initiallyFavourited: boolean;
}

export default function ProductDetailClient({
  product,
  initiallyFavourited,
}: ProductDetailClientProps) {
  const initialSelectedVariant = getDefaultSelectedVariantLabel(product);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    initialSelectedVariant,
  );
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(() =>
    getPrimaryProductImage(product, initialSelectedVariant)?.src ?? null,
  );

  const handleSelectedVariantChange = (variantLabel: string) => {
    setSelectedVariant(variantLabel);
    setSelectedImageSrc(getPrimaryProductImage(product, variantLabel)?.src ?? null);
  };

  const visibleImages = getVisibleProductImages(product, selectedVariant);
  const selectedImage =
    visibleImages.find((image) => image.src === selectedImageSrc) ??
    visibleImages[0] ??
    null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <ProductImageGallery
        images={visibleImages}
        productName={product.name}
        selectedImageSrc={selectedImage?.src ?? null}
        onSelectImageSrc={setSelectedImageSrc}
      />
      <ProductInfo
        product={product}
        initiallyFavourited={initiallyFavourited}
        selectedVariant={selectedVariant}
        onSelectedVariantChange={handleSelectedVariantChange}
        selectedImage={selectedImage}
      />
    </div>
  );
}