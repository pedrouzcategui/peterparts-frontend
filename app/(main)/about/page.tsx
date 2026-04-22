import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Eye,
  MessageSquareText,
  PackageSearch,
  ShieldCheck,
  Target,
} from "lucide-react";
import ProductLocationsMapClient from "@/components/products/ProductLocationsMapClient";
import { Button } from "@/components/ui/button";
import { getStorefrontSettings } from "@/lib/storefront-settings-store";

export const metadata: Metadata = {
  title: "Sobre nosotros | PeterParts",
  description:
    "Conoce PeterParts, nuestra misión y visión como especialistas en repuestos, engranajes y soporte para equipos de cocina.",
};

const pillars = [
  {
    title: "Especialización real",
    description:
      "Nos enfocamos en repuestos, engranajes y piezas para equipos de cocina con una mirada técnica y práctica, no como un catálogo genérico.",
    icon: PackageSearch,
  },
  {
    title: "Acompañamiento directo",
    description:
      "Ayudamos a validar compatibilidades, modelos y necesidades antes de la compra para reducir errores y acelerar la solución.",
    icon: MessageSquareText,
  },
  {
    title: "Confianza operativa",
    description:
      "Trabajamos con información clara sobre despacho, retiro y soporte para que cada pedido se coordine con seguridad y expectativa correcta.",
    icon: ShieldCheck,
  },
] as const;

export default async function AboutPage() {
  const settings = await getStorefrontSettings();

  return (
    <div className="site-shell py-10 sm:py-12 lg:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-[#ebe7e0] bg-[linear-gradient(135deg,#d91e36_0%,#630e19_100%)] text-white shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:shadow-none">
        <div className="grid gap-8 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              Sobre nosotros
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              PeterParts nace para resolver mejor la búsqueda de repuestos.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/86 sm:text-base">
              Somos una tienda especializada en repuestos, engranajes y piezas para
              equipos de cocina, con foco en compatibilidad, orientación y atención
              cercana. Nuestra prioridad no es vender por volumen, sino ayudar a que
              cada cliente encuentre la pieza correcta y compre con criterio.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
              Lo que defendemos
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/88">
              <p>Claridad en compatibilidades y modelos.</p>
              <p>Atención útil antes y después de la compra.</p>
              <p>Una experiencia más confiable para mantenimiento y reparación.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Misión
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
                Hacer más simple encontrar la pieza correcta.
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Nuestra misión es ofrecer repuestos y piezas con una atención clara,
            especializada y honesta, ayudando a cada cliente a validar compatibilidad,
            entender sus opciones y resolver necesidades reales de mantenimiento,
            reparación o reemplazo en equipos de cocina.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Visión
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
                Ser la referencia confiable en repuestos de cocina.
              </h2>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Nuestra visión es consolidar a PeterParts como una referencia cercana y
            confiable para quienes buscan repuestos, orientación técnica y una compra
            mejor informada, especialmente en marcas y equipos donde la compatibilidad
            correcta marca la diferencia.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Cómo trabajamos
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Una tienda especializada con criterio técnico y trato cercano.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Diseñamos la experiencia para que comprar una pieza no dependa de adivinar.
            Por eso combinamos catálogo, soporte y coordinación directa para que el
            proceso sea más claro desde el primer contacto.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="rounded-[1.5rem] border border-[#ebe7e0] bg-white p-5 dark:border-border dark:bg-muted/20"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#1A1714] dark:text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Ubicaciones
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Estamos donde coordinamos mejor cada entrega.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {settings.locationIntro}
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.9fr)]">
          <div>
            <ProductLocationsMapClient locations={settings.pickupLocations} />
          </div>

          <div className="space-y-4">
            {settings.pickupLocations.map((location) => (
              <article
                key={location.id ?? location.name}
                className="rounded-[1.5rem] border border-[#ebe7e0] bg-[#fbfaf7] p-5 dark:border-border dark:bg-muted/20"
              >
                <h3 className="text-lg font-semibold text-[#1A1714] dark:text-foreground">
                  {location.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {location.description}
                </p>
              </article>
            ))}

            <div className="rounded-[1.5rem] border border-dashed border-[#d8cfc3] px-5 py-4 text-sm leading-6 text-muted-foreground dark:border-border">
              {settings.deliveryNote}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Siguiente paso
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
              Explora el catálogo o consulta con nosotros antes de comprar.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              Si ya sabes qué pieza necesitas, puedes ir directo a productos. Si todavía
              estás validando compatibilidad o modelo, el foro y el soporte te ayudan a
              tomar una mejor decisión.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/products">
                Ver productos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/forum">Ir al foro</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}