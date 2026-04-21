import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Separator } from "@/components/ui/separator";
import { getBrandQueryValue } from "@/lib/brand-slugs";

const FOOTER_LINKS = [
  {
    title: "Atencion al cliente",
    links: [
      { label: "Contactanos", href: "#" },
      { label: "Estado del pedido", href: "#" },
      { label: "Devoluciones y cambios", href: "#" },
      { label: "Informacion de envio", href: "#" },
    ],
  },
  {
    title: "Sobre PeterParts",
    links: [
      { label: "Quienes somos", href: "#" },
      { label: "Empleo", href: "#" },
      { label: "Prensa", href: "#" },
      { label: "Sostenibilidad", href: "#" },
    ],
  },
  {
    title: "Nuestras marcas",
    links: [
      { label: "Cuisinart", href: "/products?brand=Cuisinart" },
      { label: "Whirlpool", href: "/products?brand=Whirlpool" },
      {
        label: "KitchenAid",
        href: `/products?brand=${getBrandQueryValue("KitchenAid")}`,
      },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="site-shell py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <BrandLogo logoClassName="h-10 w-40" />
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Tu fuente de confianza para repuestos, engranajes y batidoras de
              KitchenAid, Cuisinart y Whirlpool.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PeterParts. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Politica de privacidad
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terminos del servicio
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Configuracion de cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
