"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/providers/CartProvider";
import { formatCurrency } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SHIPPING_ESTIMATE = 24.99;
const TAX_RATE = 0.08;

interface SubmittedOrderSnapshot {
  orderNumber: string;
  itemCount: number;
  total: number;
}

function buildOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `PP-${timestamp}`;
}

export default function CheckoutPageClient() {
  const { clearCart, items, itemCount, subtotal } = useCart();
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrderSnapshot | null>(null);

  if (submittedOrder) {
    return (
      <section className="site-shell py-10 sm:py-14">
        <div className="rounded-[2rem] border bg-linear-to-br from-primary/8 via-background to-background px-6 py-16 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-muted-foreground">Pedido de muestra realizado</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Tu checkout de prueba esta completo</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            No se proceso ningun pago real. Esta pagina es una muestra de checkout conectada solo al estado local de tu carrito.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-[1.5rem] border bg-card p-6 text-left sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pedido</p>
              <p className="mt-2 text-lg font-semibold">{submittedOrder.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Articulos</p>
              <p className="mt-2 text-lg font-semibold">{submittedOrder.itemCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(submittedOrder.total)}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">Seguir comprando</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cart">Volver al carrito</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="site-shell py-10 sm:py-14">
        <div className="rounded-[2rem] border bg-card px-6 py-16 text-center sm:px-10">
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Finalizar compra</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Tu carrito esta vacio</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Agrega primero productos a tu carrito para que el resumen de compra tenga algo que procesar.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">Ver productos</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/cart">Ver carrito</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const shipping = subtotal >= 500 ? 0 : SHIPPING_ESTIMATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmittedOrder({
      orderNumber: buildOrderNumber(),
      itemCount,
      total,
    });

    clearCart();
  };

  return (
    <section className="site-shell py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Finalizar compra</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Revision de pago y entrega de muestra</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Esta es una muestra de checkout del frontend. Revisa tus articulos, ingresa datos de prueba y envia un pedido ficticio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <LockKeyhole className="h-4 w-4 text-primary" />
              Flujo de prueba seguro
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <Truck className="h-4 w-4 text-primary" />
              Resumen del pedido incluido
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>Usa aqui cualquier dato de cliente de prueba.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input id="email" type="email" placeholder="pedro@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input id="first-name" placeholder="Pedro" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" placeholder="Silva" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Numero de telefono</Label>
                <Input id="phone" type="tel" placeholder="(0424) 123-4567" required />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Envio</CardTitle>
              <CardDescription>Revisa a donde se entregaria el pedido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Direccion</Label>
                <Input id="address" placeholder="Av. Principal 123" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" placeholder="Caracas" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" placeholder="Distrito Capital" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Codigo postal</Label>
                <Input id="zip" inputMode="numeric" placeholder="1010" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pais</Label>
                <Input id="country" defaultValue="Venezuela" required />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Pago</CardTitle>
              <CardDescription>
                Campos de prueba solamente. No se procesara ningun pago real.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-name">Nombre en la tarjeta</Label>
                <Input id="card-name" placeholder="Pedro Silva" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="card-number">Numero de tarjeta</Label>
                <Input id="card-number" inputMode="numeric" placeholder="4242 4242 4242 4242" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Fecha de vencimiento</Label>
                <Input id="expiry" placeholder="12/28" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">Codigo de seguridad</Label>
                <Input id="cvv" inputMode="numeric" placeholder="123" required />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-[1.75rem] lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle>Revision del pedido</CardTitle>
            <CardDescription>{itemCount} articulo{itemCount === 1 ? "" : "s"} en tu carrito</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.brand} • {item.subcategory}</p>
                    {item.variantLabel ? (
                      <p className="mt-1 text-xs text-muted-foreground">Seleccion: {item.variantLabel}</p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Cant. {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Envio</span>
                <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Impuestos estimados</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <p className="rounded-2xl bg-primary/6 px-4 py-3 text-sm leading-6 text-muted-foreground">
              Este checkout es una vista de pago de muestra para clientes. Usa solo tu carrito local y no cobra nada.
            </p>

            <Button type="submit" size="lg" className="w-full">
              Realizar pedido de muestra
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/cart">Volver al carrito</Link>
            </Button>
          </CardContent>
        </Card>
      </form>
    </section>
  );
}