import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  CreditCard,
  MapPin,
  PhoneCall,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductLocationsMapClient from "@/components/products/ProductLocationsMapClient";
import { WHATSAPP_URL } from "@/lib/contact";
import type { StorefrontSettings } from "@/lib/storefront-settings";

function DetailCard({
  title,
  eyebrow,
  description,
  children,
  icon: Icon,
  className = "",
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <article
      className={`rounded-[1.75rem] border border-[#e7dfd6] bg-white p-6 shadow-[0_20px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none ${className}`.trim()}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f8d9de] text-primary dark:bg-primary/15">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8176] dark:text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#1A1714] dark:text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#5b5248] dark:text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

export default function ProductPurchaseDetails({
  settings,
}: {
  settings: StorefrontSettings;
}) {
  return (
    <section className="mt-12 space-y-6 pb-6 sm:mt-16">
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8176] dark:text-muted-foreground">
          Compra, entrega y soporte
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground sm:text-4xl">
          Informacion util antes de coordinar tu pedido
        </h2>
        <p className="text-sm leading-7 text-[#5b5248] dark:text-muted-foreground sm:text-base">
          Esta informacion aplica a cualquier producto del catalogo. Asi puedes
          revisar puntos de entrega, horario de trabajo, medios de pago y
          opciones de despacho antes de escribirnos.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(21rem,0.95fr)]">
        <div className="space-y-6">
          <DetailCard
            eyebrow="Ubicacion"
            title="Entregas personales y despachos coordinados"
            description={settings.locationIntro}
            icon={MapPin}
          >
            <ProductLocationsMapClient locations={settings.pickupLocations} />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {settings.pickupLocations.map((location) => (
                <div
                  key={location.name}
                  className="rounded-2xl bg-[#f5f0e9] p-4 dark:bg-muted/40"
                >
                  <p className="text-sm font-semibold text-[#1A1714] dark:text-foreground">
                    {location.name}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[#5b5248] dark:text-muted-foreground">
                    {location.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] px-4 py-3 text-sm leading-6 text-[#5b5248] dark:border-border dark:text-muted-foreground">
              {settings.deliveryNote}
            </p>
          </DetailCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DetailCard
              eyebrow="Horario"
              title="Horario de trabajo"
              description="Atendemos coordinaciones y entregas dentro del horario regular. Los fines de semana y feriados no laboramos, pero podemos responder consultas."
              icon={Clock3}
            >
              <div className="space-y-3 rounded-2xl bg-[#f5f0e9] p-4 dark:bg-muted/40">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-[#1A1714] dark:text-foreground">
                    {settings.scheduleWeekdaysLabel}
                  </span>
                  <span className="text-[#5b5248] dark:text-muted-foreground">
                    {settings.scheduleWeekdaysHours}
                  </span>
                </div>
                <div className="h-px bg-[#dfd5c8] dark:bg-border" />
                <p className="text-sm leading-6 text-[#5b5248] dark:text-muted-foreground">
                  {settings.scheduleWeekendNote}
                </p>
              </div>
            </DetailCard>

            <DetailCard
              eyebrow="Despacho"
              title="Metodos de despacho"
              description="Escoge la modalidad que mejor se ajuste a tu urgencia o ciudad. Siempre confirmamos costo y disponibilidad antes de cerrar la entrega."
              icon={Truck}
            >
              <div className="space-y-3">
                {settings.dispatchMethods.map((method) => (
                  <div
                    key={method}
                    className="rounded-2xl bg-[#f5f0e9] px-4 py-3 text-sm text-[#1A1714] dark:bg-muted/40 dark:text-foreground"
                  >
                    {method}
                  </div>
                ))}
                <div className="rounded-2xl border border-dashed border-[#d8cfc3] px-4 py-3 text-sm leading-6 text-[#5b5248] dark:border-border dark:text-muted-foreground">
                  Operadores nacionales frecuentes:{" "}
                  {settings.nationalCarriers.join(", ")}.
                </div>
              </div>
            </DetailCard>
          </div>
        </div>

        <div className="space-y-6">
          <DetailCard
            eyebrow="Pago"
            title="Metodos de pago"
            description="Aceptamos pagos en divisas y bolivar digital. Si necesitas confirmar disponibilidad de una cuenta antes de pagar, te la compartimos al momento de coordinar."
            icon={CreditCard}
          >
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#f5f0e9] p-4 dark:bg-muted/40">
                <p className="text-sm font-semibold text-[#1A1714] dark:text-foreground">
                  Divisas
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[#5b5248] dark:text-muted-foreground">
                  {settings.paymentMethodsForeign.map((method) => (
                    <li key={method}>• {method}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-[#f5f0e9] p-4 dark:bg-muted/40">
                <p className="text-sm font-semibold text-[#1A1714] dark:text-foreground">
                  Bolivar digital
                </p>
                <p className="mt-2 text-sm text-[#5b5248] dark:text-muted-foreground">
                  Transferencias y pago movil disponibles en:
                </p>
                <ul className="mt-3 grid gap-2 text-sm text-[#5b5248] dark:text-muted-foreground sm:grid-cols-2">
                  {settings.paymentMethodsBolivar.map((method) => (
                    <li key={method}>• {method}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DetailCard>

          <article className="overflow-hidden rounded-[1.75rem] bg-linear-to-br from-[#d91e36] via-[#b5152c] to-[#630E19] p-6 text-white shadow-[0_28px_64px_rgba(99,14,25,0.32)]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/72">
                  Importante
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {settings.supportTitle}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/88">
                  {settings.supportDescription}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/88">
              {settings.supportHighlight}
            </div>

            <Button
              asChild
              size="lg"
              className="mt-6 bg-white text-[#630E19] hover:bg-white/92"
            >
              <Link href={WHATSAPP_URL} target="_blank" rel="noreferrer">
                Escribir por WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}
