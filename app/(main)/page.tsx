import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { getFeaturedProducts } from "@/lib/product-data";

export const dynamic = "force-dynamic";

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
          alt="Escaparate principal de electrodomesticos KitchenAid"
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
              Seleccion KitchenAid
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Electrodomesticos de cocina premium
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">
              Descubre lo mejor de Cuisinart, Whirlpool y KitchenAid. Equipos
              de calidad para cada cocina, desde batidoras de pedestal de nivel
              profesional hasta refrigeradores eficientes.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Button asChild size="lg">
                <Link href="/products">Ver todos los productos</Link>
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
            {[
              {
                name: "Cuisinart",
                tagline: "Precision para cada receta",
                href: "/products?brand=Cuisinart",
              },
              {
                name: "Whirlpool",
                tagline: "Confianza para todos los dias",
                href: "/products?brand=Whirlpool",
              },
              {
                name: "KitchenAid",
                tagline: "Hecho para crear",
                href: "/products?brand=KitchenAid",
              },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={brand.href}
                className="group flex flex-col items-center p-8 rounded-lg border bg-background hover:shadow-md transition-shadow"
              >
                <span className="text-xl font-bold">{brand.name}</span>
                <span className="mt-1 text-sm text-muted-foreground">
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
