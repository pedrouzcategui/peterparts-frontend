import type { Metadata } from "next";
import FooterInfoPage from "@/components/layout/FooterInfoPage";

export const metadata: Metadata = {
  title: "Configuración de cookies | PeterParts",
  description:
    "Revisa un texto general sobre cómo PeterParts usa cookies y qué controles básicos tienes sobre ellas.",
};

export default function ConfiguracionDeCookiesPage() {
  return (
    <FooterInfoPage
      eyebrow="Preferencias del navegador"
      title="Las cookies ayudan a recordar sesiones, medir uso y mantener estable el sitio."
      description="Esta página resume de forma general cómo PeterParts puede usar cookies y tecnologías similares para autenticar usuarios, conservar preferencias, entender navegación y mejorar la experiencia. Algunas cookies son técnicas y otras sirven para análisis o personalización funcional." 
      asideTitle="Qué puedes hacer"
      asideItems={[
        "Aceptar o bloquear cookies desde la configuración de tu navegador.",
        "Eliminar cookies guardadas cuando quieras restablecer preferencias.",
        "Limitar cookies no esenciales, aunque algunas funciones podrían dejar de operar correctamente.",
      ]}
      sections={[
        {
          title: "Cookies necesarias",
          description:
            "Son las que permiten iniciar sesión, mantener seguridad básica, recordar elementos técnicos del sitio y sostener funciones esenciales como navegación entre páginas, carrito o protección contra abusos.",
        },
        {
          title: "Cookies de medición y rendimiento",
          description:
            "Podemos usar cookies o identificadores similares para entender qué se consulta más, detectar errores, medir rendimiento y mejorar contenido, estructura de navegación o estabilidad general del sitio.",
        },
        {
          title: "Cookies funcionales",
          description:
            "Sirven para recordar elecciones como idioma, tema visual, preferencias de acceso u otros ajustes que mejoran la experiencia cuando vuelves al sitio desde el mismo dispositivo.",
        },
      ]}
      ctaTitle="Si prefieres un control más estricto, puedes gestionar cookies directamente desde tu navegador."
      ctaDescription="La mayoría de navegadores permite revisar, bloquear o eliminar cookies por sitio. Ten en cuenta que desactivar ciertas cookies puede afectar inicio de sesión, persistencia del carrito o estabilidad de algunas secciones."
      primaryAction={{
        label: "Ver política de privacidad",
        href: "/politica-de-privacidad",
      }}
      secondaryAction={{
        label: "Ir a inicio",
        href: "/",
      }}
    >
      <section className="rounded-[1.75rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Gestión manual
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
          Tu navegador es el control principal para aceptar, bloquear o borrar cookies.
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Revisar cookies activas y eliminar las que ya no quieras conservar.",
            "Bloquear cookies de terceros si buscas una navegación más restrictiva.",
            "Usar ventanas privadas para reducir almacenamiento persistente.",
            "Repetir la configuración en cada navegador o dispositivo que utilices.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-dashed border-[#d8cfc3] px-4 py-3 text-sm leading-6 text-muted-foreground dark:border-border"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </FooterInfoPage>
  );
}