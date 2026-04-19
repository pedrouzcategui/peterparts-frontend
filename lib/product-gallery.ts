import type { Product, ProductImage } from "@/lib/types";

export function getDefaultSelectedVariantLabel(product: Product) {
  return (
    product.variants.find((variant) => variant.available)?.label ??
    product.variants[0]?.label ??
    null
  );
}

export function getVisibleProductImages(
  product: Product,
  variantLabel?: string | null,
): ProductImage[] {
  if (!variantLabel) {
    return product.images;
  }

  const matchingImages: ProductImage[] = [];
  const globalImages: ProductImage[] = [];

  for (const image of product.images) {
    const variantLabels = image.variantLabels ?? [];

    if (variantLabels.length === 0) {
      globalImages.push(image);
      continue;
    }

    if (variantLabels.includes(variantLabel)) {
      matchingImages.push(image);
    }
  }

  const visibleImages = [...matchingImages, ...globalImages];

  return visibleImages.length > 0 ? visibleImages : product.images;
}

export function getPrimaryProductImage(
  product: Product,
  variantLabel?: string | null,
) {
  return getVisibleProductImages(product, variantLabel)[0] ?? product.images[0] ?? null;
}