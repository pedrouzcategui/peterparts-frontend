import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ForumThreadStatus,
  PrismaClient,
  ProductBadge,
  ProductStatus,
} from "../lib/generated/prisma/client";
import { products } from "../lib/data";
import { roundMoney } from "../lib/currency";
import { normalizePostgresConnectionString } from "../lib/postgres-connection-string";
import { DEFAULT_STOREFRONT_SETTINGS } from "../lib/storefront-settings";
import {
  reviewAuthorNames,
  reviewClosingSentences,
  reviewOpeningSentences,
  reviewPerformanceSentences,
  reviewTitleTemplates,
  seedForumThreads,
  seedForumUsers,
} from "./seed-data";

const DEFAULT_USD_TO_VES_RATE = 36.5;

const adapter = new PrismaPg({
  connectionString: normalizePostgresConnectionString(
    process.env.DATABASE_URL!,
  ),
});
const prisma = new PrismaClient({ adapter });

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

function pickFromPool<T>(pool: T[], seed: number) {
  return pool[Math.abs(seed) % pool.length]!;
}

function getReviewSeedCount(totalReviewCount: number) {
  const scaledCount = Math.round(Math.log10(Math.max(10, totalReviewCount)) * 4);

  return Math.max(6, Math.min(14, scaledCount));
}

function buildReviewRatings(targetAverage: number, reviewCount: number) {
  const baseRating = clampRating(Math.floor(targetAverage));
  const ratings = Array.from({ length: reviewCount }, () => baseRating);
  let extraStars = Math.round(targetAverage * reviewCount - baseRating * reviewCount);
  const orderedIndexes = [
    ...Array.from({ length: reviewCount }, (_, index) => index).filter(
      (index) => index % 2 === 0,
    ),
    ...Array.from({ length: reviewCount }, (_, index) => index).filter(
      (index) => index % 2 === 1,
    ),
  ];

  for (const index of orderedIndexes) {
    if (extraStars === 0) {
      break;
    }

    ratings[index] = clampRating(ratings[index]! + 1);
    extraStars -= 1;
  }

  return ratings;
}

function buildReviewCreatedAt(productIndex: number, reviewIndex: number) {
  const month = (productIndex + reviewIndex) % 6;
  const day = ((productIndex * 3 + reviewIndex * 5) % 24) + 1;
  const hour = 9 + ((productIndex + reviewIndex) % 8);

  return new Date(Date.UTC(2026, month, day, hour, (reviewIndex * 11) % 60, 0));
}

function buildReviewTitle(productIndex: number, reviewIndex: number) {
  const title = pickFromPool(
    reviewTitleTemplates,
    productIndex * 7 + reviewIndex * 5,
  );

  return title;
}

function buildReviewBody(
  product: (typeof products)[number],
  productIndex: number,
  reviewIndex: number,
) {
  const opener = pickFromPool(
    reviewOpeningSentences,
    productIndex * 3 + reviewIndex,
  );
  const performance = pickFromPool(
    reviewPerformanceSentences,
    productIndex * 5 + reviewIndex * 2,
  );
  const closing = pickFromPool(
    reviewClosingSentences,
    productIndex * 11 + reviewIndex * 3,
  );

  return `Compre ${product.name} para la casa. ${opener} ${performance} ${closing}`;
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

function buildProductReviews(
  product: (typeof products)[number],
  productIndex: number,
) {
  const reviewCount = getReviewSeedCount(product.reviews.count);
  const ratings = buildReviewRatings(product.reviews.rating, reviewCount);

  return ratings.map((rating, reviewIndex) => ({
    reviewerName: pickFromPool(
      reviewAuthorNames,
      productIndex * 13 + reviewIndex * 7,
    ),
    title: buildReviewTitle(productIndex, reviewIndex),
    body: buildReviewBody(product, productIndex, reviewIndex),
    rating,
    isPublished: true,
    createdAt: buildReviewCreatedAt(productIndex, reviewIndex),
  }));
}

function mapThreadStatus(status: (typeof seedForumThreads)[number]["status"]) {
  switch (status) {
    case "approved":
      return ForumThreadStatus.APPROVED;
    case "rejected":
      return ForumThreadStatus.REJECTED;
    default:
      return ForumThreadStatus.PENDING;
  }
}

async function resetCatalog() {
  await prisma.forumReplyVote.deleteMany();
  await prisma.forumThreadVote.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.pickupLocation.deleteMany();
  await prisma.storefrontSetting.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: "@forum.peterparts.local",
      },
    },
  });
}

function buildForumSeedEmail(user: (typeof seedForumUsers)[number]) {
  return `${user.id}@forum.peterparts.local`;
}

async function seedForum() {
  const forumUserIds = new Map<string, string>();

  for (const user of seedForumUsers) {
    const createdUser = await prisma.user.upsert({
      where: {
        email: buildForumSeedEmail(user),
      },
      update: {
        name: user.name,
        firstName: user.name.split(" ")[0] ?? user.name,
        lastName: user.name.split(" ").slice(1).join(" ") || null,
        emailVerified: new Date(user.joinedDate),
      },
      create: {
        email: buildForumSeedEmail(user),
        name: user.name,
        firstName: user.name.split(" ")[0] ?? user.name,
        lastName: user.name.split(" ").slice(1).join(" ") || null,
        emailVerified: new Date(user.joinedDate),
      },
      select: {
        id: true,
      },
    });

    forumUserIds.set(user.id, createdUser.id);
  }

  const threadIds = new Map<string, string>();

  for (const thread of seedForumThreads) {
    const createdThread = await prisma.forumThread.create({
      data: {
        slug: thread.slug ?? slugify(thread.title),
        status: mapThreadStatus(thread.status),
        moderatedAt: thread.moderatedAt ? new Date(thread.moderatedAt) : null,
        title: thread.title,
        content: thread.content,
        tags: thread.tags,
        upvotes: thread.upvotes,
        downvotes: thread.downvotes,
        authorId: forumUserIds.get(thread.authorId)!,
        createdAt: new Date(thread.createdAt),
      },
      select: {
        id: true,
      },
    });

    threadIds.set(thread.id, createdThread.id);
  }

  for (const thread of seedForumThreads) {
    const threadId = threadIds.get(thread.id)!;

    for (const reply of thread.replies) {
      await prisma.forumReply.create({
        data: {
          threadId,
          authorId: forumUserIds.get(reply.authorId)!,
          content: reply.content,
          upvotes: reply.upvotes,
          downvotes: reply.downvotes,
          createdAt: new Date(reply.createdAt),
        },
      });
    }
  }
}

async function seedCatalog() {
  const brandIds = new Map<string, string>();
  const rootCategoryIds = new Map<string, string>();
  const leafCategoryIds = new Map<string, string>();
  const exchangeRate = await prisma.exchangeRate.create({
    data: {
      baseCurrency: "USD",
      quoteCurrency: "VES",
      rate: DEFAULT_USD_TO_VES_RATE.toFixed(6),
      source: "seed",
      isActive: true,
    },
    select: {
      rate: true,
    },
  });
  const usdToVesRate = Number(exchangeRate.rate);

  await prisma.storefrontSetting.create({
    data: {
      key: DEFAULT_STOREFRONT_SETTINGS.key,
      locationIntro: DEFAULT_STOREFRONT_SETTINGS.locationIntro,
      deliveryNote: DEFAULT_STOREFRONT_SETTINGS.deliveryNote,
      scheduleWeekdaysLabel: DEFAULT_STOREFRONT_SETTINGS.scheduleWeekdaysLabel,
      scheduleWeekdaysHours: DEFAULT_STOREFRONT_SETTINGS.scheduleWeekdaysHours,
      scheduleWeekendNote: DEFAULT_STOREFRONT_SETTINGS.scheduleWeekendNote,
      paymentMethodsForeign: DEFAULT_STOREFRONT_SETTINGS.paymentMethodsForeign,
      paymentMethodsBolivar: DEFAULT_STOREFRONT_SETTINGS.paymentMethodsBolivar,
      dispatchMethods: DEFAULT_STOREFRONT_SETTINGS.dispatchMethods,
      nationalCarriers: DEFAULT_STOREFRONT_SETTINGS.nationalCarriers,
      supportTitle: DEFAULT_STOREFRONT_SETTINGS.supportTitle,
      supportDescription: DEFAULT_STOREFRONT_SETTINGS.supportDescription,
      supportHighlight: DEFAULT_STOREFRONT_SETTINGS.supportHighlight,
      pickupLocations: {
        create: DEFAULT_STOREFRONT_SETTINGS.pickupLocations.map(
          (location, index) => ({
            name: location.name,
            description: location.description,
            latitude: location.latitude.toFixed(6),
            longitude: location.longitude.toFixed(6),
            sortOrder: index,
          }),
        ),
      },
    },
  });

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
    const productReviews = buildProductReviews(product, index);
    const reviewAverage =
      productReviews.reduce((total, review) => total + review.rating, 0) /
      productReviews.length;
    const createdProduct = await prisma.product.create({
      data: {
        sku: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: toMoneyString(product.price),
        priceVes: toMoneyString(roundMoney(product.price * usdToVesRate)),
        compareAtPrice: product.originalPrice
          ? toMoneyString(product.originalPrice)
          : undefined,
        compareAtPriceVes: product.originalPrice
          ? toMoneyString(roundMoney(product.originalPrice * usdToVesRate))
          : undefined,
        modelNumber: product.style,
        primaryColor: product.color,
        features: product.features,
        shippingInfo: product.shippingInfo,
        stockQuantity: product.inStock ? 25 : 0,
        status: ProductStatus.ACTIVE,
        badge: mapBadge(product.badge),
        featuredRank: index + 1,
        averageRating: reviewAverage.toFixed(2),
        reviewCount: productReviews.length,
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

    await prisma.productReview.createMany({
      data: productReviews.map((review) => ({
        productId: createdProduct.id,
        reviewerName: review.reviewerName,
        title: review.title,
        body: review.body,
        rating: review.rating,
        isPublished: review.isPublished,
        createdAt: review.createdAt,
      })),
    });
  }
}

async function main() {
  await resetCatalog();
  await seedCatalog();
  await seedForum();

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
