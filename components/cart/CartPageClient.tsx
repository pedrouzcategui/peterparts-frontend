"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SHIPPING_ESTIMATE = 24.99;
const FREE_SHIPPING_THRESHOLD = 500;

export default function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="site-shell py-10 sm:py-14">
        <div className="rounded-[2rem] border bg-linear-to-br from-primary/6 via-background to-background px-6 py-16 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Tu carrito esta vacio
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Arma tu cocina ideal</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Agrega electrodomesticos a tu carrito y revisa precios, cantidades y detalles de entrega antes de finalizar la compra.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/products">Comprar productos</Link>
          </Button>
        </div>
      </section>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_ESTIMATE;
  const total = subtotal + shipping;

  return (
    <section className="site-shell py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Carrito de compras
          </p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Revisa tus productos seleccionados
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Ajusta cantidades, elimina productos y continua a un checkout de muestra cuando estes listo.
          </p>
        </div>
        <Button variant="outline" onClick={clearCart}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="grid gap-4 rounded-[1.75rem] border bg-card p-4 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <span>{item.brand}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{item.subcategory}</span>
                </div>
                <Link href={`/products/${item.slug}`} className="mt-2 block text-lg font-semibold leading-tight hover:text-primary">
                  {item.name}
                </Link>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p>Modelo: {item.style || "Articulo del catalogo"}</p>
                  {item.variantLabel ? <p>Seleccion: {item.variantLabel}</p> : null}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-full border bg-background">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Reducir cantidad de ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Aumentar cantidad de ${item.name}`}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                <div>
                  <p className="text-lg font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  {item.originalPrice ? (
                    <p className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.originalPrice * item.quantity)}
                    </p>
                  ) : null}
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:mt-3">
                  {item.inStock ? "Listo para enviar" : "Disponible bajo pedido"}
                </p>
              </div>
            </article>
          ))}
        </div>

        <Card className="h-fit rounded-[1.75rem] lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle className="text-xl">Resumen del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envio estimado</span>
                <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <p className="rounded-2xl bg-primary/6 px-4 py-3 text-sm leading-6 text-muted-foreground">
              Los pedidos superiores a {formatCurrency(FREE_SHIPPING_THRESHOLD)} califican para envio estandar gratis.
            </p>

            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Continuar al pago</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/products">Seguir comprando</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}