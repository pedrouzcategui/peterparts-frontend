import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ShoppingBag } from "lucide-react";
import FavouriteToggleButton from "@/components/products/FavouriteToggleButton";
import ProductImageWithFallback from "@/components/products/ProductImageWithFallback";
import { Button } from "@/components/ui/button";
import {
  buildLoginRedirectPath,
  FAVOURITES_PATH,
  getCurrentFavouriteUser,
  getFavouriteProductsForUser,
} from "@/lib/favourites";
import { formatUsd, formatVes } from "@/lib/currency";
import {
  getDefaultSelectedVariantLabel,
  getPrimaryProductImage,
} from "@/lib/product-gallery";

function formatSavedDate(value: Date): string {
  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(value);
}

export default async function FavouritesPage() {
  const currentUser = await getCurrentFavouriteUser();

  if (!currentUser) {
    redirect(buildLoginRedirectPath(FAVOURITES_PATH));
  }

  const favourites = await getFavouriteProductsForUser(currentUser.id);
  const displayName =
    currentUser.firstName?.trim() ||
    currentUser.name?.trim() ||
    currentUser.email;

  return (
    <div className="site-shell py-8 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-[#ebe7e0] bg-[linear-gradient(135deg,#d91e36_0%,#630e19_100%)] text-white shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:shadow-none">
          <div className="flex flex-col gap-6 px-6 py-8 sm:px-8 sm:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                Favoritos
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Los guardados de {displayName}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
                Reúne aquí los repuestos y accesorios que quieres revisar más
                tarde, comparar o comprar cuando tengas todo listo.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  Guardados ahora
                </p>
                <p className="mt-1 text-2xl font-bold">{favourites.length}</p>
              </div>
            </div>
          </div>
        </section>

        {favourites.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-[#d7d0c6] bg-[#faf7f2] px-6 py-12 text-center dark:border-border dark:bg-muted/20">
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Heart className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#1A1714] dark:text-foreground">
                  Aún no has guardado productos
                </h2>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                  Usa el botón Guardar desde cualquier producto para crear tu
                  lista de favoritos y volver rápido cuando quieras comprar.
                </p>
              </div>
              <Button asChild size="lg" className="mt-2">
                <Link href="/products">
                  <ShoppingBag className="h-4 w-4" />
                  Explorar productos
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-2">
            {favourites.map(({ savedAt, product }) => {
              const priceUsd = product.priceUsd ?? product.price;
              const defaultVariantLabel = getDefaultSelectedVariantLabel(product);
              const primaryImage = getPrimaryProductImage(
                product,
                defaultVariantLabel,
              );
              const priceVes =
                typeof product.priceVes === "number" && product.priceVes > 0
                  ? formatVes(product.priceVes)
                  : null;

              return (
                <article
                  key={product.databaseId}
                  className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[#ebe7e0] bg-white shadow-[0_18px_48px_rgba(26,23,20,0.08)] dark:border-border dark:bg-card dark:shadow-none"
                >
                  <div className="grid gap-0 sm:grid-cols-[220px_minmax(0,1fr)]">
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative flex min-h-55 items-center justify-center border-b border-[#ebe7e0] bg-[#fcfaf7] p-6 sm:border-b-0 sm:border-r dark:border-border dark:bg-muted/30"
                    >
                      <ProductImageWithFallback
                        src={primaryImage?.src}
                        alt={primaryImage?.alt ?? product.name}
                        sizes="(max-width: 768px) 100vw, 220px"
                        className="object-contain p-3"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col gap-4 px-6 py-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Guardado el {formatSavedDate(savedAt)}
                        </p>
                        <Link
                          href={`/products/${product.slug}`}
                          className="block text-2xl font-semibold leading-tight tracking-tight text-[#1A1714] transition-colors hover:text-primary dark:text-foreground"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          {product.brand} · {product.subcategory}
                        </p>
                      </div>

                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {product.description}
                      </p>

                      <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
                        <div>
                          <p className="text-[1.75rem] font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
                            {formatUsd(priceUsd)}
                          </p>
                          {priceVes ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Precio en bolívares: {priceVes}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button asChild variant="outline">
                            <Link href={`/products/${product.slug}`}>
                              Ver producto
                            </Link>
                          </Button>
                          <FavouriteToggleButton
                            productId={product.databaseId}
                            redirectPath={FAVOURITES_PATH}
                            initiallyFavourited
                            size="default"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
