import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";
import { buildWhatsAppUrl } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prensa | PeterParts",
  description:
    "Información general para medios, colaboraciones y consultas editoriales sobre PeterParts.",
};

export default function PrensaPage() {
  return (
    <FooterInfoPage
      eyebrow="Sobre PeterParts"
      title="PeterParts es una marca enfocada en resolver mejor la compra de repuestos."
      description="Somos un negocio especializado en repuestos, engranajes y piezas para equipos de cocina. Nuestra propuesta combina catálogo, orientación sobre compatibilidad y una coordinación directa de compra para que el cliente tome mejores decisiones y reduzca errores al buscar una pieza específica."
      asideTitle="Consultas de prensa"
      asideItems={[
        "Información sobre la marca y su propuesta de valor.",
        "Contexto sobre repuestos, mantenimiento y compra informada.",
        "Solicitudes editoriales, entrevistas y colaboraciones puntuales.",
      ]}
      sections={[
        {
          title: "Qué hace distinta a la marca",
          description:
            "PeterParts no busca parecer un marketplace genérico. Nos enfocamos en una categoría concreta y en una atención que ayude a validar compatibilidad, entender la pieza y coordinar mejor la compra.",
        },
        {
          title: "Temas en los que podemos aportar",
          description:
            "Podemos conversar sobre búsqueda de repuestos, fallas comunes en equipos de cocina, criterios de compatibilidad, mantenimiento preventivo y experiencia de compra en un negocio especializado.",
        },
        {
          title: "Cómo coordinar una solicitud",
          description:
            "Si tu consulta es editorial o de colaboración, escríbenos con el medio, el contexto de la nota y el enfoque de la solicitud. Así podremos responder con mayor claridad y priorizar la información adecuada.",
        },
      ]}
      ctaTitle="Si necesitas contexto o una consulta editorial, escríbenos con el enfoque de la solicitud."
      ctaDescription="Cuando el mensaje incluye medio, formato y tema de interés, es más fácil darte una respuesta útil y ordenada."
      primaryAction={{
        label: "Contactar a PeterParts",
        href: buildWhatsAppUrl(
          "Hola Peter Parts, tengo una consulta de prensa o colaboracion.",
        ),
      }}
      secondaryAction={{
        label: "Ver quienes somos",
        href: "/about",
      }}
    />
  );
}