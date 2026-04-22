"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  CART_STORAGE_KEY,
  createCartItem,
  getCartItemCount,
  getCartSubtotal,
  parseStoredCart,
  serializeCart,
  type CartItem,
} from "@/lib/cart";
import type { Product } from "@/lib/types";
import { toast } from "sonner";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem, quantity?: number) => void;
  addProduct: (
    product: Product,
    variantLabel?: string,
    quantity?: number,
    selectedImage?: Product["images"][number],
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_EVENT = "peterparts-cart-updated";

const emptyCart: CartItem[] = [];

function getAvailableCartQuantity(item: Pick<CartItem, "inStock" | "stockQuantity">): number {
  if (!item.inStock) {
    return 0;
  }

  if (!Number.isFinite(item.stockQuantity)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.max(0, Math.floor(item.stockQuantity));
}

function getAddedToCartDescription(item: CartItem, totalQuantity: number): string {
  const details = [item.variantLabel, `Cantidad: ${totalQuantity}`].filter(Boolean);

  return details.join(" · ");
}

let cachedStorageValue: string | null = null;
let cachedCartItems: CartItem[] = emptyCart;

function subscribeToCart(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(CART_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CART_STORAGE_EVENT, callback);
  };
}

function getClientCartSnapshot(): CartItem[] {
  try {
    const storageValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (storageValue === cachedStorageValue) {
      return cachedCartItems;
    }

    cachedStorageValue = storageValue;
    cachedCartItems = parseStoredCart(storageValue);

    return cachedCartItems;
  } catch {
    return cachedCartItems;
  }
}

function getServerCartSnapshot(): CartItem[] {
  return emptyCart;
}

function dispatchCartChange(): void {
  window.dispatchEvent(new Event(CART_STORAGE_EVENT));
}

function persistCart(items: CartItem[]): void {
  cachedCartItems = items;
  const serializedCart = items.length === 0 ? null : serializeCart(items);
  cachedStorageValue = serializedCart;

  try {
    if (serializedCart === null) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CART_STORAGE_KEY, serializedCart);
    }
  } finally {
    dispatchCartChange();
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const items = useSyncExternalStore(
    subscribeToCart,
    getClientCartSnapshot,
    getServerCartSnapshot,
  );

  const mutateCart = (updater: (currentItems: CartItem[]) => CartItem[]) => {
    persistCart(updater(getClientCartSnapshot()));
  };

  const addItem = (item: CartItem, quantity = 1) => {
    const normalizedQuantity = Math.max(1, Math.floor(quantity));
    const maxAvailableQuantity = getAvailableCartQuantity(item);
    let totalQuantity = 0;
    let didAddItem = false;
    let reachedInventoryLimit = false;

    if (maxAvailableQuantity === 0) {
      toast.error(`${item.name} no tiene inventario disponible.`);
      return;
    }

    mutateCart((currentItems) => {
      const existingItem = currentItems.find((currentItem) => currentItem.id === item.id);
      const currentQuantity = existingItem?.quantity ?? 0;
      const requestedQuantity = currentQuantity + normalizedQuantity;
      const nextQuantity = Math.min(requestedQuantity, maxAvailableQuantity);

      totalQuantity = nextQuantity;
      reachedInventoryLimit = nextQuantity < requestedQuantity;

      if (nextQuantity === currentQuantity) {
        return currentItems;
      }

      didAddItem = true;

      if (!existingItem) {
        return [...currentItems, { ...item, quantity: nextQuantity }];
      }

      return currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? {
              ...currentItem,
              quantity: nextQuantity,
            }
          : currentItem,
      );
    });

    if (!didAddItem) {
      toast.info(`Ya alcanzaste el inventario disponible de ${item.name}.`, {
        description: `Máximo disponible: ${maxAvailableQuantity}.`,
      });
      return;
    }

    toast.success(`${item.name} agregado al carrito`, {
      description: reachedInventoryLimit
        ? `Cantidad ajustada al inventario disponible: ${totalQuantity}.`
        : getAddedToCartDescription(item, totalQuantity),
    });
  };

  const addProduct = (
    product: Product,
    variantLabel?: string,
    quantity = 1,
    selectedImage?: Product["images"][number],
  ) => {
    addItem(createCartItem(product, variantLabel, selectedImage), quantity);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    let reachedInventoryLimit = false;
    let inventoryLimit = 0;

    mutateCart((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.id !== itemId);
      }

      return currentItems.map((item) =>
        item.id === itemId
          ? (() => {
              inventoryLimit = getAvailableCartQuantity(item);
              const nextQuantity = Math.min(
                Math.max(1, Math.floor(quantity)),
                inventoryLimit || 1,
              );

              reachedInventoryLimit = nextQuantity < quantity;

              return {
                ...item,
                quantity: nextQuantity,
              };
            })()
          : item,
      );
    });

    if (reachedInventoryLimit) {
      toast.info(`Solo hay ${inventoryLimit} unidades disponibles para este producto.`);
    }
  };

  const removeItem = (itemId: string) => {
    mutateCart((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const clearCart = () => {
    persistCart([]);
  };

  const value: CartContextValue = {
    items,
    itemCount: getCartItemCount(items),
    subtotal: getCartSubtotal(items),
    addItem,
    addProduct,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}