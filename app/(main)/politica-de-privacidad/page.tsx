import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";

export const metadata: Metadata = {
  title: "Política de privacidad | PeterParts",
  description:
    "Consulta un texto general sobre cómo PeterParts recopila, usa y protege datos personales.",
};

export default function PoliticaDePrivacidadPage() {
  return (
    <FooterInfoPage
      eyebrow="Aviso legal"
      title="Así tratamos la información que compartes con PeterParts."
      description="Esta política describe de forma general qué datos podemos recopilar cuando navegas por el sitio, haces una consulta o coordinas una compra, cómo se usan esos datos y en qué casos podrían compartirse para operar el servicio." 
      asideTitle="Resumen rápido"
      asideItems={[
        "Recopilamos datos de contacto, navegación y pedidos cuando son necesarios para atenderte.",
        "Usamos esa información para responder consultas, procesar compras y mejorar la experiencia del sitio.",
        "No vendemos tus datos personales a terceros con fines publicitarios independientes.",
      ]}
      sections={[
        {
          title: "Qué información podemos recopilar",
          description:
            "Podemos recibir datos como nombre, correo electrónico, teléfono, dirección de entrega, historial de pedidos, mensajes enviados por formularios o WhatsApp y datos técnicos básicos de navegación como IP, dispositivo, navegador y páginas visitadas.",
        },
        {
          title: "Cómo usamos la información",
          description:
            "Usamos los datos para validar consultas, coordinar pedidos, dar seguimiento a entregas, responder soporte, prevenir abusos, administrar la cuenta del usuario y entender cómo mejorar catálogo, contenido y funcionamiento del sitio.",
        },
        {
          title: "Cuándo podríamos compartir datos",
          description:
            "Podemos compartir información con proveedores que nos ayudan a operar pagos, mensajería, hosting, autenticación, analítica o despacho, siempre dentro de lo necesario para prestar el servicio o cumplir obligaciones legales.",
        },
      ]}
      ctaTitle="Si necesitas corregir o consultar tus datos, puedes escribirnos directamente."
      ctaDescription="Revisaremos solicitudes razonables relacionadas con acceso, actualización o eliminación de información, según el contexto operativo y las obligaciones que debamos conservar."
      primaryAction={{
        label: "Ir a contacto",
        href: "/contacto",
      }}
      secondaryAction={{
        label: "Ver cookies",
        href: "/configuracion-de-cookies",
      }}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Conservación y seguridad
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Protegemos la información con medidas razonables de acceso y resguardo.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Conservamos datos durante el tiempo necesario para operar pedidos,
            soporte, prevención de fraude, obligaciones contables o mejora del
            servicio. Aplicamos controles administrativos y técnicos razonables,
            aunque ningún sistema de transmisión o almacenamiento es completamente
            infalible.
          </p>
        </article>

        <article className="rounded-[1.75rem] border border-[#ebe7e0] bg-[#fbfaf7] p-6 shadow-[0_18px_48px_rgba(26,23,20,0.04)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Tus decisiones
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
            Puedes limitar cierta información, aunque eso puede afectar parte del servicio.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Puedes optar por no compartir algunos datos, pero funciones como crear
            pedidos, recibir seguimiento o guardar preferencias pueden depender de
            esa información. También puedes gestionar cookies desde tu navegador o
            revisar nuestra página de configuración de cookies.
          </p>
        </article>
      </section>
    </FooterInfoPage>
  );
}