export interface StaticCatalogImage {
  src: string;
  alt: string;
}

export interface StaticCatalogVariant {
  label: string;
  available: boolean;
  colorValue?: string;
}

export interface StaticCatalogReviews {
  rating: number;
  count: number;
}

export interface StaticCatalogProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  color: string;
  style: string;
  images: StaticCatalogImage[];
  variants: StaticCatalogVariant[];
  reviews: StaticCatalogReviews;
  badge?: string;
  inStock: boolean;
  shippingInfo: string;
}

export interface MercadoLibreSnapshotImage {
  fileName: string;
  alt: string;
}

export interface MercadoLibreSnapshotVariant {
  label: string;
  available?: boolean;
}

export interface MercadoLibreSnapshotItem {
  sellerItemId: string;
  title: string;
  brand: string;
  category: string;
  subcategory: string;
  priceUsd: number;
  originalPriceUsd?: number;
  description: string;
  features: string[];
  primaryColor: string;
  modelNumber: string;
  images: MercadoLibreSnapshotImage[];
  variants?: MercadoLibreSnapshotVariant[];
  reviewRating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  shippingInfo?: string;
  permalink?: string;
}