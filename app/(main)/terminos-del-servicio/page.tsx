import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";

export const metadata: Metadata = {
  title: "Términos del servicio | PeterParts",
  description:
    "Lee un texto general sobre condiciones de uso del sitio y coordinación de compras en PeterParts.",
};

export default function TerminosDelServicioPage() {
  return (
    <FooterInfoPage
      eyebrow="Condiciones generales"
      title="Estas son las reglas básicas para usar el sitio y coordinar compras con PeterParts."
      description="Al navegar por el sitio, crear una cuenta o generar un pedido, aceptas estas condiciones generales de uso. Su objetivo es dejar claro qué puedes esperar del servicio y qué responsabilidades corresponden a cada parte." 
      asideTitle="Puntos principales"
      asideItems={[
        "La disponibilidad, compatibilidad y despacho se confirman durante la coordinación del pedido.",
        "El usuario debe proporcionar datos correctos y revisar la información del producto antes de comprar.",
        "PeterParts puede actualizar contenido, precios y condiciones cuando sea necesario.",
      ]}
      sections={[
        {
          title: "Uso correcto del sitio",
          description:
            "Esperamos un uso legítimo del catálogo, formularios y cuentas. No está permitido intentar vulnerar el sitio, automatizar accesos no autorizados, publicar información engañosa o usar la plataforma para fines distintos a la consulta y coordinación real de compras.",
        },
        {
          title: "Productos, precios y disponibilidad",
          description:
            "Hacemos esfuerzos razonables por mantener información actualizada, pero algunos datos pueden cambiar por ajustes de inventario, tipo de cambio, compatibilidad o revisión operativa. Un pedido generado inicia un proceso de coordinación y validación, no una promesa automática e irrevocable de entrega inmediata.",
        },
        {
          title: "Cuentas y comunicaciones",
          description:
            "Si creas una cuenta, eres responsable de mantener segura tu información de acceso. También aceptas que podamos comunicarnos contigo por correo, teléfono o mensajería para confirmar pedidos, resolver incidencias o dar seguimiento al servicio solicitado.",
        },
      ]}
      ctaTitle="Si tienes dudas sobre una condición específica, consúltala antes de confirmar el pedido."
      ctaDescription="Cuando el producto requiere validación de compatibilidad o coordinación especial, lo mejor es resolverlo antes para evitar errores o demoras innecesarias."
      primaryAction={{
        label: "Consultar antes de comprar",
        href: "/contacto",
      }}
      secondaryAction={{
        label: "Ver envíos",
        href: "/informacion-de-envio",
      }}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Limitación y cambios
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Podemos actualizar el servicio, el catálogo y estas condiciones.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            PeterParts puede modificar funcionalidades, suspender accesos,
            corregir errores de contenido y actualizar estos términos cuando lo
            requiera la operación, el marco legal o el propio desarrollo del
            sitio. El uso continuado después de esos cambios implica aceptación
            de la versión vigente.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Cancelaciones y soporte
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Algunas situaciones requieren revisión manual antes de cerrar la compra.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Si detectamos falta de inventario, inconsistencias en datos del pedido
            o dudas razonables sobre compatibilidad, podemos pausar, ajustar o
            cancelar la coordinación. Cuando eso ocurra, intentaremos informarte
            por el canal de contacto que hayas proporcionado.
          </p>
        </article>
      </section>
    </FooterInfoPage>
  );
}