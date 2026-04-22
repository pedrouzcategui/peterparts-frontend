"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  formatCurrency,
  getCartSummary,
  type CartItem,
} from "@/lib/cart";
import { isBlobProductImageUrl } from "@/lib/product-image-storage";

interface SubmittedOrderSnapshot {
  orderNumber: string;
  itemCount: number;
  total: number;
  whatsappUrl: string;
}

interface CreateOrderPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
  items: CartItem[];
}

interface CreateOrderResponse {
  order: SubmittedOrderSnapshot;
}

function getFormValue(
  formData: FormData,
  key: keyof Omit<CreateOrderPayload, "items">,
): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export default function CheckoutPageClient() {
  const { clearCart, items } = useCart();
  const [submittedOrder, setSubmittedOrder] =
    useState<SubmittedOrderSnapshot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (submittedOrder) {
    return (
      <section className="site-shell py-10 sm:py-14">
        <div className="rounded-[2rem] border bg-linear-to-br from-primary/8 via-background to-background px-6 py-16 text-center sm:px-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <p className="mt-6 text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Pedido creado
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Tu orden ya fue registrada
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Guardamos tu pedido y ya tiene un identificador. El siguiente paso es escribirnos por WhatsApp para coordinar pago, entrega y confirmar disponibilidad usando ese ID.
          </p>
          <div className="mx-auto mt-8 grid max-w-2xl gap-4 rounded-[1.5rem] border bg-card p-6 text-left sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                ID del pedido
              </p>
              <p className="mt-2 text-lg font-semibold">
                {submittedOrder.orderNumber}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Artículos
              </p>
              <p className="mt-2 text-lg font-semibold">
                {submittedOrder.itemCount}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Total
              </p>
              <p className="mt-2 text-lg font-semibold">
                {formatCurrency(submittedOrder.total)}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={submittedOrder.whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" />
                Ir a WhatsApp con mi pedido
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/products">Seguir comprando</Link>
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
          <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
            Finalizar compra
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Tu carrito está vacío
          </h1>
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

  const { itemCount, subtotal, shipping, tax, total } = getCartSummary(items);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload: CreateOrderPayload = {
      email: getFormValue(formData, "email"),
      firstName: getFormValue(formData, "firstName"),
      lastName: getFormValue(formData, "lastName"),
      phone: getFormValue(formData, "phone"),
      address: getFormValue(formData, "address"),
      city: getFormValue(formData, "city"),
      state: getFormValue(formData, "state"),
      zip: getFormValue(formData, "zip"),
      country: getFormValue(formData, "country"),
      notes: getFormValue(formData, "notes"),
      items,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseBody = (await response.json().catch(() => null)) as
        | CreateOrderResponse
        | { message?: string }
        | null;

      if (!response.ok || !responseBody || !("order" in responseBody)) {
        const message =
          responseBody && "message" in responseBody && responseBody.message
            ? responseBody.message
            : "No pudimos crear tu pedido. Intenta nuevamente.";

        setSubmitError(message);
        toast.error(message);
        return;
      }

      setSubmittedOrder(responseBody.order);
      clearCart();
    } catch {
      const message =
        "No pudimos crear tu pedido. Revisa tu conexion e intenta nuevamente.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="site-shell py-10 sm:py-14">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Finalizar compra
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">
              Revisión del pedido y datos de entrega
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Revisa tus artículos, completa tus datos y genera el pedido. El pago y la coordinación final se resolverán por WhatsApp después de crear la orden.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Pedido directo sin pasarela
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border px-4 py-2">
              <Truck className="h-4 w-4 text-primary" />
              Coordinacion posterior por WhatsApp
            </span>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]"
      >
        <div className="space-y-6">
          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
              <CardDescription>
                Usaremos estos datos para registrar y coordinar tu pedido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="pedro@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input id="first-name" name="firstName" placeholder="Pedro" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input id="last-name" name="lastName" placeholder="Silva" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Número de teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(0424) 123-4567"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Envío</CardTitle>
              <CardDescription>
                Revisa adónde se entregaría el pedido.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" placeholder="Av. Principal 123" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" placeholder="Caracas" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" placeholder="Distrito Capital" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Código postal</Label>
                <Input id="zip" name="zip" inputMode="numeric" placeholder="1010" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input id="country" name="country" defaultValue="Venezuela" required />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem]">
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
              <CardDescription>
                Agrega alguna referencia útil para el equipo si lo necesitas. Es opcional.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas del pedido</Label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={5}
                  placeholder="Modelo del equipo, referencia de entrega, detalles que quieras coordinar..."
                  className="flex min-h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit rounded-[1.75rem] lg:sticky lg:top-28">
          <CardHeader>
            <CardTitle>Revisión del pedido</CardTitle>
            <CardDescription>
              {itemCount} artículo{itemCount === 1 ? "" : "s"} en tu carrito
            </CardDescription>
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
                      unoptimized={isBlobProductImageUrl(item.image.src)}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.brand} • {item.subcategory}
                    </p>
                    {item.variantLabel ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Selección: {item.variantLabel}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Cant. {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
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
                <span className="text-muted-foreground">Envío</span>
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

            {submitError ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
                {submitError}
              </p>
            ) : null}

            <p className="rounded-2xl bg-primary/6 px-4 py-3 text-sm leading-6 text-muted-foreground">
              Al crear el pedido guardaremos la orden con su ID y te llevaremos a WhatsApp para terminar de coordinar pago y entrega.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creando pedido..." : "Crear pedido"}
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