import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  ProductBadge,
  ProductStatus,
} from "../lib/generated/prisma/client";
import { products } from "../lib/data";
import { normalizePostgresConnectionString } from "../lib/postgres-connection-string";

const adapter = new PrismaPg({
  connectionString: normalizePostgresConnectionString(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

const SAMPLE_REVIEW_BODIES = [
  "Setup was straightforward and it has held up well with regular kitchen use.",
  "The finish looks great in person and the performance has been consistent.",
  "This was a practical upgrade and it does exactly what we expected it to do.",
  "Shipping was smooth and the product quality feels in line with the price.",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toMoneyString(value: number) {
  return value.toFixed(2);
}

function clampRating(value: number) {
  return Math.max(1, Math.min(5, value));
}

function mapBadge(badge?: string) {
  switch (badge) {
    case "Sale":
      return ProductBadge.SALE;
    case "Just In":
      return ProductBadge.JUST_IN;
    case "Best Seller":
      return ProductBadge.BEST_SELLER;
    default:
      return undefined;
  }
}

function buildSampleReviews(product: (typeof products)[number]) {
  const roundedAverage = Math.round(product.reviews.rating);
  const sampleCount = Math.min(
    4,
    Math.max(1, Math.ceil(product.reviews.rating) - 1),
  );

  return Array.from({ length: sampleCount }, (_, index) => {
    const ratingOffset = index % 2 === 0 ? 0 : -1;
    const rating = clampRating(roundedAverage + ratingOffset);

    return {
      reviewerName: `Sample Customer ${index + 1}`,
      title: `${product.brand} ${product.subcategory} review ${index + 1}`,
      body: `${product.name}: ${SAMPLE_REVIEW_BODIES[index % SAMPLE_REVIEW_BODIES.length]}`,
      rating,
      isPublished: true,
    };
  });
}

async function resetCatalog() {
  await prisma.productReview.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
}

async function seedCatalog() {
  const brandIds = new Map<string, string>();
  const rootCategoryIds = new Map<string, string>();
  const leafCategoryIds = new Map<string, string>();

  for (const brandName of [
    ...new Set(products.map((product) => product.brand)),
  ]) {
    const brand = await prisma.brand.create({
      data: {
        name: brandName,
        slug: slugify(brandName),
      },
      select: { id: true },
    });

    brandIds.set(brandName, brand.id);
  }

  for (const categoryName of [
    ...new Set(products.map((product) => product.category)),
  ]) {
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        slug: slugify(categoryName),
      },
      select: { id: true },
    });

    rootCategoryIds.set(categoryName, category.id);
  }

  for (const product of products) {
    const key = `${product.category}::${product.subcategory}`;

    if (leafCategoryIds.has(key)) {
      continue;
    }

    const category = await prisma.category.create({
      data: {
        name: product.subcategory,
        slug: slugify(`${product.category}-${product.subcategory}`),
        parentId: rootCategoryIds.get(product.category),
      },
      select: { id: true },
    });

    leafCategoryIds.set(key, category.id);
  }

  for (const [index, product] of products.entries()) {
    const categoryKey = `${product.category}::${product.subcategory}`;
    const createdProduct = await prisma.product.create({
      data: {
        sku: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: toMoneyString(product.price),
        compareAtPrice: product.originalPrice
          ? toMoneyString(product.originalPrice)
          : undefined,
        modelNumber: product.style,
        primaryColor: product.color,
        features: product.features,
        shippingInfo: product.shippingInfo,
        stockQuantity: product.inStock ? 25 : 0,
        status: ProductStatus.ACTIVE,
        badge: mapBadge(product.badge),
        featuredRank: index + 1,
        averageRating: product.reviews.rating.toFixed(2),
        reviewCount: product.reviews.count,
        brandId: brandIds.get(product.brand)!,
        categoryId: leafCategoryIds.get(categoryKey)!,
      },
      select: { id: true },
    });

    await prisma.productImage.createMany({
      data: product.images.map((image, imageIndex) => ({
        productId: createdProduct.id,
        url: image.src,
        altText: image.alt,
        sortOrder: imageIndex,
        isPrimary: imageIndex === 0,
      })),
    });

    await prisma.productVariant.createMany({
      data: product.variants.map((variant, variantIndex) => ({
        productId: createdProduct.id,
        label: variant.label,
        available: variant.available,
        sortOrder: variantIndex,
      })),
    });

    const sampleReviews = buildSampleReviews(product);
    await prisma.productReview.createMany({
      data: sampleReviews.map((review) => ({
        productId: createdProduct.id,
        reviewerName: review.reviewerName,
        title: review.title,
        body: review.body,
        rating: review.rating,
        isPublished: review.isPublished,
      })),
    });
  }
}

async function main() {
  await resetCatalog();
  await seedCatalog();

  console.log(`Seeded ${products.length} products across the catalog.`);
}

main()
  .catch((error) => {
    console.error("Prisma seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
