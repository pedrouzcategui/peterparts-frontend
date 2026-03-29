import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Carrito de compras",
  description: "Revisa los productos guardados actualmente en tu carrito de PeterParts.",
};

export default function CartPage() {
  return <CartPageClient />;
}