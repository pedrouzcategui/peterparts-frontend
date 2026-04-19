import type {
  MercadoLibreSnapshotItem,
  StaticCatalogProduct,
} from "@/lib/catalog-types";

const SELLER_ID = "156535073";
const DEFAULT_SHIPPING_INFO = "Envio coordinado por el vendedor";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProductId(item: MercadoLibreSnapshotItem) {
  return `mlv-${item.sellerItemId.toLowerCase()}`;
}

function buildProductSlug(item: MercadoLibreSnapshotItem) {
  return slugify(`${item.brand}-${item.title}-${item.sellerItemId}`);
}

function buildImagePath(fileName: string) {
  return `/images/vendors/mercadolibre-${SELLER_ID}/${fileName}`;
}

function normalizeSnapshotItem(
  item: MercadoLibreSnapshotItem,
): StaticCatalogProduct {
  return {
    id: buildProductId(item),
    slug: buildProductSlug(item),
    name: item.title.trim(),
    brand: item.brand.trim(),
    category: item.category.trim(),
    subcategory: item.subcategory.trim(),
    price: item.priceUsd,
    originalPrice: item.originalPriceUsd,
    description: item.description.trim(),
    features: item.features.map((feature) => feature.trim()).filter(Boolean),
    color: item.primaryColor.trim(),
    style: item.modelNumber.trim(),
    images: item.images.map((image) => ({
      src: buildImagePath(image.fileName),
      alt: image.alt.trim(),
    })),
    variants:
      item.variants?.map((variant) => ({
        label: variant.label.trim(),
        available: variant.available ?? true,
      })) ?? [{ label: item.primaryColor.trim(), available: true }],
    reviews: {
      rating: item.reviewRating ?? 4.5,
      count: item.reviewCount ?? 120,
    },
    badge: item.badge,
    inStock: item.inStock ?? true,
    shippingInfo: item.shippingInfo?.trim() || DEFAULT_SHIPPING_INFO,
  };
}

// Populate this snapshot with seller products as they are curated from MercadoLibre.
// Images should be copied to public/images/vendors/mercadolibre-156535073/.
export const mercadolibre156535073Snapshot: MercadoLibreSnapshotItem[] = [];

export const mercadolibreSeller156535073Products: StaticCatalogProduct[] =
  mercadolibre156535073Snapshot.map(normalizeSnapshotItem);