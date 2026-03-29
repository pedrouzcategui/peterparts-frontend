import type { Product } from "@/lib/types";

export const CART_STORAGE_KEY = "peterparts-cart:v1";

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
}

interface StoredCart {
  version: number;
  items: CartItem[];
}

function isCartItem(value: unknown): value is CartItem {
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
    typeof item.image?.src === "string" &&
    typeof item.image?.alt === "string"
  );
}

export function getCartLineId(productId: string, variantLabel?: string): string {
  return variantLabel ? `${productId}::${variantLabel}` : productId;
}

export function createCartItem(
  product: Product,
  variantLabel?: string,
): CartItem {
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
      src: product.images[0]?.src ?? "/images/placeholder.jpg",
      alt: product.images[0]?.alt ?? product.name,
    },
    quantity: 1,
    variantLabel,
    style: product.style,
    shippingInfo: product.shippingInfo,
    inStock: product.inStock,
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

    return parsed.items.filter(isCartItem).map((item) => ({
      ...item,
      quantity: Math.max(1, Math.floor(item.quantity)),
    }));
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}