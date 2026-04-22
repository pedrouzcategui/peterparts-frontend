import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { getBrandQueryValue } from "@/lib/brand-slugs";
import { getFeaturedProducts } from "@/lib/product-data";

export const dynamic = "force-dynamic";

const HOMEPAGE_BRANDS = [
  {
    name: "Cuisinart",
    tagline: "Piezas y accesorios para mezclar y preparar",
    href: "/products?brand=Cuisinart",
    logoLightSrc: "/images/cuisinart-logo.png",
    logoDarkSrc: "/images/cuisinart-logo-dark.png",
  },
  {
    name: "Whirlpool",
    tagline: "Repuestos confiables para mantenimiento y reparación",
    href: "/products?brand=Whirlpool",
    logoLightSrc: "/images/whirlpool-logo.png",
    logoDarkSrc: "/images/whirlpool-logo-dark.png",
  },
  {
    name: "KitchenAid",
    tagline: "Engranajes, accesorios y batidoras seleccionadas",
    href: `/products?brand=${getBrandQueryValue("KitchenAid")}`,
    logoLightSrc: "/images/kitchenaid-logo.png",
    logoDarkSrc: "/images/kitchenaid-logo.png",
  },
] as const;

/**
 * Home page — Server Component
 * Hero section + featured products for SEO and user engagement.
 */
export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div>
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <Image
          src="/kitchenaid-hero.jpg"
          alt="Escaparate principal de repuestos y batidoras PeterParts"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/30" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="site-shell relative py-24 sm:py-32 lg:py-36">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/75">
              KitchenAid, Cuisinart y Whirlpool
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Repuestos, engranajes y batidoras
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Encuentra piezas compatibles para reparar y mantener tus equipos,
              junto con batidoras seleccionadas de KitchenAid, Cuisinart y
              Whirlpool. PeterParts no vende electrodomésticos completos.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button asChild size="lg">
                <Link href="/products">Explorar catálogo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="site-shell py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Productos destacados</h2>
          <Link
            href="/products"
            className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand showcase */}
      <section className="border-t bg-muted/40">
        <div className="site-shell py-16">
          <h2 className="text-2xl font-bold text-center mb-10">Nuestras marcas</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOMEPAGE_BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                aria-label={`${brand.name}. ${brand.tagline}`}
                className="group flex min-h-44 flex-col items-center justify-center rounded-lg border bg-background px-8 py-10 text-center transition-shadow hover:shadow-md"
              >
                <span className="sr-only">{brand.name}</span>
                <span
                  className="flex h-16 w-full max-w-60 items-center justify-center sm:h-20"
                  aria-hidden="true"
                >
                  <span className="relative block h-full w-full overflow-hidden">
                    {brand.logoLightSrc === brand.logoDarkSrc ? (
                      <Image
                        src={brand.logoLightSrc}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 12rem, 15rem"
                        className="object-contain object-center"
                      />
                    ) : (
                      <>
                        <Image
                          src={brand.logoLightSrc}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 12rem, 15rem"
                          className="object-contain object-center dark:hidden"
                        />
                        <Image
                          src={brand.logoDarkSrc}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 12rem, 15rem"
                          className="hidden object-contain object-center dark:block"
                        />
                      </>
                    )}
                  </span>
                </span>
                <span className="mt-5 text-sm text-muted-foreground">
                  {brand.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
