import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Estado del pedido | PeterParts",
  description:
    "Consulta el avance de tu pedido y conoce qué información ayuda a PeterParts a responder con mayor precisión.",
};

export default function EstadoDelPedidoPage() {
  return (
    <FooterInfoPage
      eyebrow="Atención al cliente"
      title="Consulta tu pedido con la información justa para responderte más rápido."
      description="Si ya realizaste tu compra y quieres saber en qué etapa se encuentra, podemos revisar el pedido contigo. Mientras más contexto compartas desde el inicio, más fácil será confirmar pago, preparación, retiro o despacho sin retrasos innecesarios."
      asideTitle="Para ubicar tu compra"
      asideItems={[
        "Número de pedido o nombre completo de quien compró.",
        "Fecha aproximada de la compra o comprobante de pago.",
        "Canal acordado: retiro, delivery en Caracas o envío nacional.",
      ]}
      sections={[
        {
          title: "Qué validamos por ti",
          description:
            "Revisamos si el pago ya fue identificado, si la pieza está lista para coordinar y cuál es el siguiente paso operativo según el método de entrega elegido.",
        },
        {
          title: "Cómo acelerar la respuesta",
          description:
            "Si escribes con el número de pedido, una foto del comprobante y el nombre del titular, podemos cruzar la información más rápido y evitar mensajes de seguimiento innecesarios.",
        },
        {
          title: "Coordinación posterior",
          description:
            "Cuando el pedido ya está confirmado, también te ayudamos a revisar ventana de retiro, delivery o datos del envío para que el cierre de la compra sea claro.",
        },
      ]}
      ctaTitle="Escríbenos con tu número de pedido y te ayudamos a ubicarlo."
      ctaDescription="El canal más directo para seguimiento es WhatsApp. Si ya tienes comprobante o referencia del pedido, inclúyelo desde el primer mensaje."
      primaryAction={{
        label: "Consultar pedido",
        href: buildWhatsAppUrl(
          "Hola Peter Parts, quiero consultar el estado de mi pedido.",
        ),
      }}
      secondaryAction={{
        label: "Ir a contacto",
        href: "/contacto",
      }}
    >
      <section className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Recomendación práctica
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
          Un solo mensaje completo suele resolver mejor que varios mensajes sueltos.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Si tu consulta incluye número de pedido, nombre, método de entrega y una
          referencia de pago, podemos orientarte con más precisión sobre la etapa en la
          que está tu compra y la coordinación que sigue.
        </p>
      </section>
    </FooterInfoPage>
  );
}