import type { Metadata } from "next";
import CheckoutPageClient from "@/components/cart/CheckoutPageClient";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Revisa tus productos, crea tu pedido y continua la coordinacion por WhatsApp.",
};

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}