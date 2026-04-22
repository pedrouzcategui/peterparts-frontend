import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Empleo | PeterParts",
  description:
    "Conoce el tipo de perfiles que aportan valor en PeterParts y cómo presentarte para futuras oportunidades.",
};

export default function EmpleoPage() {
  return (
    <FooterInfoPage
      eyebrow="Sobre PeterParts"
      title="Buscamos personas que entiendan servicio, detalle y operación real."
      description="PeterParts crece alrededor de una idea simple: orientar bien una compra técnica exige criterio, orden y cercanía. Por eso valoramos perfiles que puedan aportar en atención al cliente, operación comercial, catálogo y coordinación de pedidos con una mentalidad práctica."
      asideTitle="Perfiles que suman"
      asideItems={[
        "Atención al cliente con foco en claridad y seguimiento.",
        "Operación, catálogo y organización comercial.",
        "Interés por productos, compatibilidad y detalle técnico.",
      ]}
      sections={[
        {
          title: "Lo que valoramos",
          description:
            "Nos interesan personas responsables, directas y capaces de ordenar información. En un negocio de repuestos, una buena comunicación evita errores, mejora la compra y aporta confianza al cliente.",
        },
        {
          title: "Áreas donde puede haber oportunidades",
          description:
            "Atención al cliente, apoyo operativo, carga y mantenimiento de catálogo, seguimiento comercial y coordinación de entregas son áreas donde un perfil sólido puede aportar valor.",
        },
        {
          title: "Cómo presentarte",
          description:
            "Si quieres que consideremos tu perfil para oportunidades futuras, envíanos una presentación breve con experiencia relevante, área de interés y disponibilidad. Mientras más concreto sea el contexto, mejor podremos evaluarlo.",
        },
      ]}
      ctaTitle="Si crees que puedes aportar valor al negocio, queremos leerte."
      ctaDescription="Puedes escribirnos con una presentación corta sobre tu experiencia y el tipo de rol en el que te ves aportando dentro de PeterParts."
      primaryAction={{
        label: "Presentar perfil",
        href: buildWhatsAppUrl(
          "Hola Peter Parts, quiero presentar mi perfil para futuras oportunidades.",
        ),
      }}
      secondaryAction={{
        label: "Conocer la empresa",
        href: "/about",
      }}
    >
      <section className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Enfoque de trabajo
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
          Operamos con cercanía, criterio y atención al detalle.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
          Este no es un catálogo masivo ni una atención automática. La forma de
          trabajar en PeterParts exige entender el contexto del cliente, ordenar bien
          la información y responder con criterio cuando la compatibilidad de una pieza
          marca la diferencia.
        </p>
      </section>
    </FooterInfoPage>
  );
}