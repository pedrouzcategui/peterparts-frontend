import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Devoluciones y cambios | PeterParts",
  description:
    "Información general sobre cómo PeterParts revisa solicitudes de cambios y devoluciones de repuestos y piezas.",
};

export default function DevolucionesYCambiosPage() {
  return (
    <FooterInfoPage
      eyebrow="Atención al cliente"
      title="Revisamos cada caso con criterio técnico y contexto de compra."
      description="En repuestos y piezas, los cambios y devoluciones suelen depender de compatibilidad, condición del producto y motivo de la solicitud. Por eso preferimos revisar cada caso de forma individual antes de coordinar cualquier devolución, para evitar traslados innecesarios y darte una respuesta más clara."
      asideTitle="Antes de solicitar un cambio"
      asideItems={[
        "Escríbenos con el número de pedido y motivo de la solicitud.",
        "Indica si hubo duda de compatibilidad, daño o error en la pieza recibida.",
        "Comparte fotos del repuesto y del empaque si eso ayuda a evaluar el caso.",
      ]}
      sections={[
        {
          title: "Compatibilidad primero",
          description:
            "Como trabajamos con piezas específicas por modelo, la validación de compatibilidad es clave. Si surge una duda después de comprar, revisamos contigo el modelo del equipo y la referencia del repuesto antes de definir el siguiente paso.",
        },
        {
          title: "Evaluación caso por caso",
          description:
            "No tratamos todos los pedidos igual. Analizamos el estado del producto, la condición del empaque y el motivo de la solicitud para indicarte si aplica cambio, devolución o una revisión adicional.",
        },
        {
          title: "Coordinación clara",
          description:
            "Si hace falta retorno de la pieza o una nueva coordinación, te explicamos el canal recomendado según estés en Caracas o en otra ciudad, y qué información necesitamos para avanzar.",
        },
      ]}
      ctaTitle="Si hubo un problema con tu pedido, cuéntanos el caso con detalle."
      ctaDescription="Mientras más contexto nos compartas sobre la pieza y la compra, más útil será la orientación y más claro el siguiente paso."
      primaryAction={{
        label: "Solicitar revisión",
        href: buildWhatsAppUrl(
          "Hola Peter Parts, quiero consultar un cambio o devolución de mi pedido.",
        ),
      }}
      secondaryAction={{
        label: "Ver estado del pedido",
        href: "/estado-del-pedido",
      }}
    >
      <section className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Qué ayuda más
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
          Fotos, referencia del pedido y una explicación breve del problema.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Ese contexto permite revisar si el inconveniente está en la compatibilidad,
          en la coordinación del pedido o en la condición de la pieza, y así darte una
          respuesta útil desde el primer intercambio.
        </p>
      </section>
    </FooterInfoPage>
  );
}