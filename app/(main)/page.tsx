import Link from "next/link";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import ProductCard from "@/components/products/ProductCard";

/**
 * Home page — Server Component
 * Hero section + featured products for SEO and user engagement.
 */
export default function HomePage() {
  // Show a few featured products on the homepage
  const featuredProducts = products.filter((p) => p.badge).slice(0, 6);

  return (
    <div>
      {/* Hero section */}
      <section className="bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Premium Kitchen Appliances
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Shop the best from Cuisinart, Whirlpool, and KitchenAid. Quality
            gear for every kitchen, from professional-grade stand mixers to
            energy-efficient refrigerators.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/products">Shop All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors"
          >
            View All
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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold text-center mb-10">Our Brands</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                name: "Cuisinart",
                tagline: "Savor the Good Life",
                href: "/products?brand=Cuisinart",
              },
              {
                name: "Whirlpool",
                tagline: "Every Day, Care",
                href: "/products?brand=Whirlpool",
              },
              {
                name: "KitchenAid",
                tagline: "For the Way It's Made",
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
