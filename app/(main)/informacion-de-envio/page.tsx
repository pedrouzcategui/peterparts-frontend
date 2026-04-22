import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";
import { getStorefrontSettings } from "@/lib/storefront-settings-store";

export const metadata: Metadata = {
  title: "Información de envío | PeterParts",
  description:
    "Conoce cómo PeterParts coordina retiros, delivery en Caracas y envíos nacionales para repuestos y piezas.",
};

export default async function InformacionDeEnvioPage() {
  const settings = await getStorefrontSettings();

  return (
    <FooterInfoPage
      eyebrow="Atención al cliente"
      title="Coordinamos entrega y despacho según el tipo de pedido y tu ubicación."
      description="Nuestro objetivo no es ofrecer una promesa genérica de envío, sino coordinar el método más realista para cada compra. Según la ciudad, el horario y el tipo de repuesto, podemos trabajar con retiro, delivery en Caracas o envío nacional con transportista."
      asideTitle="Opciones disponibles"
      asideItems={settings.dispatchMethods}
      sections={[
        {
          title: "Retiro coordinado",
          description:
            "Si te resulta más conveniente, puedes coordinar entrega personal en nuestros puntos habituales. Esto ayuda especialmente cuando buscas confirmar la compra y resolver rápido el retiro.",
        },
        {
          title: "Delivery en Caracas",
          description:
            "Para algunas zonas de Caracas coordinamos delivery según disponibilidad. El costo y el horario dependen del lugar de entrega y de la planificación del día.",
        },
        {
          title: "Envíos nacionales",
          description:
            "También trabajamos con despacho nacional para piezas y repuestos, coordinando la salida con transportistas según destino, tipo de producto y confirmación del pedido.",
        },
      ]}
      ctaTitle="Consulta la mejor forma de recibir tu pedido antes de comprar."
      ctaDescription="Si nos dices tu ciudad y el producto que te interesa, podemos orientarte sobre retiro, delivery o envío nacional con más precisión."
      primaryAction={{
        label: "Consultar envío",
        href: buildWhatsAppUrl(
          "Hola Peter Parts, quiero consultar opciones de envio para un pedido.",
        ),
      }}
      secondaryAction={{
        label: "Contáctanos",
        href: "/contacto",
      }}
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Cobertura y coordinación
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Entregas personales, motorizado y despacho nacional.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {settings.locationIntro}
          </p>
          <p className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-border">
            {settings.deliveryNote}
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Transportistas habituales
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Coordinamos envíos nacionales con aliados conocidos.
          </h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {settings.nationalCarriers.map((carrier) => (
              <span
                key={carrier}
                className="rounded-full border border-[#d8cfc3] bg-white px-4 py-2 text-sm text-[#1A1714] dark:border-border dark:bg-muted/20 dark:text-foreground"
              >
                {carrier}
              </span>
            ))}
          </div>
        </article>
      </section>
    </FooterInfoPage>
  );
}