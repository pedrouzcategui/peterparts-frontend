import type { Product } from "@/lib/types";
import { getPrimaryProductImage } from "@/lib/product-gallery";

export const CART_STORAGE_KEY = "peterparts-cart:v1";

export const SHIPPING_ESTIMATE = 24.99;
export const TAX_RATE = 0.08;

const CART_STORAGE_VERSION = 1;

export interface CartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  brand: Product["brand"];
  subcategory: string;
  price: number;
  originalPrice?: number;
  image: {
    src: string;
    alt: string;
  };
  quantity: number;
  variantLabel?: string;
  style: string;
  shippingInfo: string;
  inStock: boolean;
  stockQuantity: number;
}

interface StoredCart {
  version: number;
  items: CartItem[];
}

export function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem> & {
    image?: {
      src?: unknown;
      alt?: unknown;
    };
  };

  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.brand === "string" &&
    typeof item.subcategory === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number" &&
    typeof item.style === "string" &&
    typeof item.shippingInfo === "string" &&
    typeof item.inStock === "boolean" &&
    (item.stockQuantity === undefined || typeof item.stockQuantity === "number") &&
    typeof item.image?.src === "string" &&
    typeof item.image?.alt === "string"
  );
}

function normalizeStockQuantity(item: Pick<CartItem, "inStock"> & { stockQuantity?: number }): number {
  if (!item.inStock) {
    return 0;
  }

  if (typeof item.stockQuantity !== "number" || !Number.isFinite(item.stockQuantity)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.max(0, Math.floor(item.stockQuantity));
}

function normalizeCartQuantity(item: Pick<CartItem, "inStock" | "quantity"> & { stockQuantity?: number }): number {
  const stockQuantity = normalizeStockQuantity(item);

  if (stockQuantity === 0) {
    return 1;
  }

  return Math.min(stockQuantity, Math.max(1, Math.floor(item.quantity)));
}

export function parseCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isCartItem).map((item) => ({
    ...item,
    stockQuantity: normalizeStockQuantity(item),
    quantity: normalizeCartQuantity(item),
  }));
}

export function getCartLineId(productId: string, variantLabel?: string): string {
  return variantLabel ? `${productId}::${variantLabel}` : productId;
}

export function createCartItem(
  product: Product,
  variantLabel?: string,
  selectedImage?: Product["images"][number],
): CartItem {
  const image = selectedImage ?? getPrimaryProductImage(product, variantLabel);

  return {
    id: getCartLineId(product.id, variantLabel),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    subcategory: product.subcategory,
    price: product.price,
    originalPrice: product.originalPrice,
    image: {
      src: image?.src ?? "/images/placeholder.jpg",
      alt: image?.alt ?? product.name,
    },
    quantity: 1,
    variantLabel,
    style: product.style,
    shippingInfo: product.shippingInfo,
    inStock: product.inStock,
    stockQuantity: Math.max(0, Math.floor(product.stockQuantity)),
  };
}

export function parseStoredCart(storageValue: string | null): CartItem[] {
  if (!storageValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storageValue) as Partial<StoredCart>;

    if (
      parsed.version !== CART_STORAGE_VERSION ||
      !Array.isArray(parsed.items)
    ) {
      return [];
    }

    return parseCartItems(parsed.items);
  } catch {
    return [];
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify({
    version: CART_STORAGE_VERSION,
    items,
  } satisfies StoredCart);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function getCartSubtotal(items: CartItem[]): number {
  return items.reduce((subtotal, item) => subtotal + item.price * item.quantity, 0);
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function getCartSummary(items: CartItem[]): CartSummary {
  const itemCount = getCartItemCount(items);
  const subtotal = getCartSubtotal(items);
  const shipping = subtotal >= 500 ? 0 : SHIPPING_ESTIMATE;
  const tax = subtotal * TAX_RATE;

  return {
    itemCount,
    subtotal,
    shipping,
    tax,
    total: subtotal + shipping + tax,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}