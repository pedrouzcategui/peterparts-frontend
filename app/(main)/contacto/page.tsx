import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";
import { getStorefrontSettings } from "@/lib/storefront-settings-store";

export const metadata: Metadata = {
  title: "Contáctanos | PeterParts",
  description:
    "Canales de contacto y orientación para compatibilidad, repuestos, entrega y soporte de compra en PeterParts.",
};

export default async function ContactoPage() {
  const settings = await getStorefrontSettings();
  const contactHref = buildWhatsAppUrl(
    "Hola Peter Parts, quiero ayuda para encontrar un repuesto compatible.",
  );

  return (
    <FooterInfoPage
      eyebrow="Atención al cliente"
      title="Te ayudamos a encontrar la pieza correcta antes de comprar."
      description="En PeterParts atendemos consultas sobre compatibilidad, engranajes, batidoras y coordinación de pedidos con un enfoque práctico. Si nos compartes el modelo del equipo o una foto de la pieza, podemos orientarte con más precisión y reducir errores antes de confirmar la compra."
      asideTitle="Lo esencial"
      asideItems={[
        settings.supportTitle,
        `${settings.scheduleWeekdaysLabel}: ${settings.scheduleWeekdaysHours}`,
        settings.scheduleWeekendNote,
      ]}
      sections={[
        {
          title: "Compatibilidad y diagnóstico inicial",
          description:
            "Antes de comprar, podemos ayudarte a validar si el repuesto corresponde al modelo de tu equipo y si la pieza que buscas resuelve realmente la falla que estás viendo.",
        },
        {
          title: "Qué conviene enviarnos",
          description:
            "Para responder mejor, comparte el modelo del equipo, una foto de la pieza, una referencia visible o una breve explicación del problema. Eso nos permite orientarte con menos idas y vueltas.",
        },
        {
          title: "Soporte durante la compra",
          description:
            "También resolvemos dudas sobre pago, retiro, delivery en Caracas y envíos nacionales para que sepas cómo coordinar tu pedido antes de cerrar la compra.",
        },
      ]}
      ctaTitle="Habla con nosotros y valida tu compra con más contexto."
      ctaDescription="Si ya tienes el modelo o una foto de la pieza, podemos ayudarte a revisar compatibilidad y el canal de entrega más conveniente para tu pedido."
      primaryAction={{
        label: "Escribir por WhatsApp",
        href: contactHref,
      }}
      secondaryAction={{
        label: "Ver productos",
        href: "/products",
      }}
    >
      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Horario y respuesta
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Atención orientada a resolver, no solo a vender.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            {settings.supportDescription}
          </p>
          <p className="mt-4 rounded-2xl border border-dashed border-[#d8cfc3] px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-border">
            {settings.supportHighlight}
          </p>
        </article>

        <section className="grid gap-4 sm:grid-cols-2">
          {settings.pickupLocations.map((location) => (
            <article
              key={location.id ?? location.name}
              className="rounded-[1.5rem] border border-[#ebe7e0] bg-white p-5 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Punto de entrega
              </p>
              <h3 className="mt-3 text-lg font-semibold text-[#1A1714] dark:text-foreground">
                {location.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {location.description}
              </p>
            </article>
          ))}
        </section>
      </section>
    </FooterInfoPage>
  );
}