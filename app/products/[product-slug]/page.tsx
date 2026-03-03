import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { products, getProductBySlug } from "@/lib/data";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ProductPageProps {
  params: Promise<{ "product-slug": string }>;
}

/**
 * Generate static params so all product pages can be statically generated.
 * This is great for SEO — pages are pre-rendered at build time.
 */
export async function generateStaticParams() {
  return products.map((product) => ({
    "product-slug": product.slug,
  }));
}

/**
 * Dynamic metadata for SEO — each product page gets unique title, description,
 * and open graph data based on the product.
 */
export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { "product-slug": slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found | PeterParts" };
  }

  return {
    title: `${product.name} | PeterParts`,
    description: product.description,
    openGraph: {
      title: `${product.name} | PeterParts`,
      description: product.description,
      images: product.images.map((img) => ({
        url: img.src,
        alt: img.alt,
      })),
    },
  };
}

/**
 * /products/[product-slug] — Server Component
 * Individual product detail page (PDP).
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { "product-slug": slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.src),
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.reviews.rating,
      reviewCount: product.reviews.count,
    },
  };

  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/products">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/products?brand=${product.brand}`}>
                  {product.brand}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* PDP layout: gallery + info */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductImageGallery
            images={product.images}
            productName={product.name}
          />
          <ProductInfo product={product} />
        </div>
      </div>
    </>
  );
}
