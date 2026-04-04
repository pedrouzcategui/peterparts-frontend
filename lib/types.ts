// Product types for the PeterParts marketplace
// These types will be shared between the API response and UI components

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductVariant {
  label: string;
  available: boolean;
}

export interface ProductReview {
  rating: number;
  count: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  priceUsd?: number;
  priceVes?: number;
  originalPrice?: number;
  originalPriceUsd?: number;
  originalPriceVes?: number;
  description: string;
  features: string[];
  color: string;
  style: string;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: ProductReview;
  badge?: string;
  inStock: boolean;
  shippingInfo: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  name: string;
  key: string;
  options: FilterOption[];
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-low-high"
  | "price-high-low"
  | "top-rated";
