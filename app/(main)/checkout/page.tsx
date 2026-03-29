import type { Metadata } from "next";
import CheckoutPageClient from "@/components/cart/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Revisa tus productos y completa un checkout de muestra de PeterParts.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}