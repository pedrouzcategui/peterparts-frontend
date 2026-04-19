import "server-only";

import { randomUUID } from "node:crypto";
import { ProductStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type AdminProductInputStatus = "active" | "draft" | "archived";

export interface AdminProductWriteInput {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: AdminProductInputStatus;
  imageUrls: string[];
}

export interface PlaceholderImportResult {
  created: number;
  skipped: number;
}

export interface BulkArchiveAdminProductsResult {
  matchedCount: number;
  archivedCount: number;
}

export interface BulkHardDeleteAdminProductsResult {
  matchedCount: number;
  deletedCount: number;
}

const FALLBACK_IMAGE_URL = "/images/placeholder.jpg";

const PLACEHOLDER_IMPORT_PRODUCTS: AdminProductWriteInput[] = [
  {
    name: "KitchenAid Artisan Series Mixer 5QT",
    brand: "KitchenAid",
    category: "Batidoras de pedestal",
    price: 449.99,
    stock: 12,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
  {
    name: "Cuisinart Procesador de Alimentos 14 Tazas",
    brand: "Cuisinart",
    category: "Procesadores de alimentos",
    price: 249.99,
    stock: 20,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
  {
    name: "Whirlpool Refrigerador French Door 25 ft",
    brand: "Whirlpool",
    category: "Refrigeradores",
    price: 1999.99,
    stock: 5,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
  {
    name: "KitchenAid Batidora de Mano 7 Velocidades",
    brand: "KitchenAid",
    category: "Batidoras de mano",
    price: 79.99,
    stock: 30,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
  {
    name: "Cuisinart Cafetera PerfecTemp 14 Tazas",
    brand: "Cuisinart",
    category: "Cafeteras",
    price: 99.95,
    stock: 18,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
  {
    name: "Whirlpool Lavavajillas Quiet 47 dBA",
    brand: "Whirlpool",
    category: "Lavavajillas",
    price: 899.99,
    stock: 8,
    status: "draft",
    imageUrls: [FALLBACK_IMAGE_URL],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeText(value: string, fieldLabel: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length === 0) {
    throw new Error(`El campo ${fieldLabel} es obligatorio.`);
  }

  return normalized;
}

function normalizeProductIds(productIds: string[]): string[] {
  const uniqueIds = new Set<string>();

  for (const productId of productIds) {
    const normalizedId = productId.trim();

    if (!normalizedId) {
      continue;
    }

    uniqueIds.add(normalizedId);
  }

  return Array.from(uniqueIds);
}

function isValidImageUrl(value: string): boolean {
  if (value.startsWith("/")) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeImageUrls(imageUrls: string[]): string[] {
  const uniqueUrls = new Set<string>();

  for (const imageUrl of imageUrls) {
    const normalized = imageUrl.trim();

    if (!normalized) {
      continue;
    }

    if (!isValidImageUrl(normalized)) {
      throw new Error(`URL de imagen invalida: ${normalized}`);
    }

    uniqueUrls.add(normalized);
  }

  if (uniqueUrls.size === 0) {
    return [FALLBACK_IMAGE_URL];
  }

  return Array.from(uniqueUrls);
}

function toProductStatus(status: AdminProductInputStatus): ProductStatus {
  switch (status) {
    case "active":
      return ProductStatus.ACTIVE;
    case "archived":
      return ProductStatus.ARCHIVED;
    case "draft":
      return ProductStatus.DRAFT;
  }
}

function validateAdminProductInput(
  input: AdminProductWriteInput,
): AdminProductWriteInput {
  const name = normalizeText(input.name, "nombre");
  const brand = normalizeText(input.brand, "marca");
  const category = normalizeText(input.category, "categoria");

  if (!Number.isFinite(input.price) || input.price < 0) {
    throw new Error("El precio debe ser un numero mayor o igual a 0.");
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error("El inventario debe ser un numero entero mayor o igual a 0.");
  }

  const imageUrls = normalizeImageUrls(input.imageUrls);

  return {
    name,
    brand,
    category,
    price: Number(input.price.toFixed(2)),
    stock: input.stock,
    status: input.status,
    imageUrls,
  };
}

async function resolveUniqueBrandSlug(baseSlug: string): Promise<string> {
  const slugRoot = baseSlug || `marca-${randomUUID().slice(0, 8)}`;
  let candidate = slugRoot;
  let suffix = 2;

  // Ensure deterministic slug assignment if a collision happens.
  while (true) {
    const existing = await prisma.brand.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${slugRoot}-${suffix}`;
    suffix += 1;
  }
}

async function resolveUniqueCategorySlug(baseSlug: string): Promise<string> {
  const slugRoot = baseSlug || `categoria-${randomUUID().slice(0, 8)}`;
  let candidate = slugRoot;
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${slugRoot}-${suffix}`;
    suffix += 1;
  }
}

async function ensureBrandId(brandName: string): Promise<string> {
  const existingByName = await prisma.brand.findUnique({
    where: { name: brandName },
    select: { id: true },
  });

  if (existingByName) {
    return existingByName.id;
  }

  const slug = await resolveUniqueBrandSlug(slugify(brandName));
  const brand = await prisma.brand.create({
    data: {
      name: brandName,
      slug,
    },
    select: { id: true },
  });

  return brand.id;
}

async function ensureRootCategoryId(categoryName: string): Promise<string> {
  const existing = await prisma.category.findFirst({
    where: {
      name: categoryName,
      parentId: null,
    },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const slug = await resolveUniqueCategorySlug(slugify(categoryName));
  const category = await prisma.category.create({
    data: {
      name: categoryName,
      slug,
    },
    select: { id: true },
  });

  return category.id;
}

async function resolveUniqueProductSlug(
  name: string,
  productIdToIgnore?: string,
): Promise<string> {
  const baseSlug = slugify(name) || `producto-${randomUUID().slice(0, 8)}`;
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === productIdToIgnore) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function buildUniqueSku(name: string): Promise<string> {
  const prefix = slugify(name).replace(/-/g, "").toUpperCase().slice(0, 8) || "PRODUCT";
  let attempt = 0;

  while (attempt < 10) {
    const suffix = randomUUID().slice(0, 6).toUpperCase();
    const candidate = `${prefix}-${suffix}`;
    const existing = await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    attempt += 1;
  }

  throw new Error("No se pudo generar un SKU unico. Intenta de nuevo.");
}

function buildNestedImageEntries(productName: string, imageUrls: string[]) {
  return imageUrls.map((url, index) => ({
    url,
    altText: `${productName} imagen ${index + 1}`,
    sortOrder: index,
    isPrimary: index === 0,
  }));
}

function buildImageRows(productId: string, productName: string, imageUrls: string[]) {
  return imageUrls.map((url, index) => ({
    productId,
    url,
    altText: `${productName} imagen ${index + 1}`,
    sortOrder: index,
    isPrimary: index === 0,
  }));
}

export async function createAdminProduct(input: AdminProductWriteInput): Promise<void> {
  const payload = validateAdminProductInput(input);

  const [brandId, categoryId, slug, sku] = await Promise.all([
    ensureBrandId(payload.brand),
    ensureRootCategoryId(payload.category),
    resolveUniqueProductSlug(payload.name),
    buildUniqueSku(payload.name),
  ]);

  await prisma.product.create({
    data: {
      sku,
      slug,
      name: payload.name,
      description: `Producto ${payload.name} importado desde administracion.`,
      price: payload.price.toFixed(2),
      stockQuantity: payload.stock,
      status: toProductStatus(payload.status),
      features: [],
      brandId,
      categoryId,
      images: {
        create: buildNestedImageEntries(payload.name, payload.imageUrls),
      },
    },
  });
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductWriteInput,
): Promise<void> {
  const payload = validateAdminProductInput(input);

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });

  if (!existingProduct) {
    throw new Error("Producto no encontrado.");
  }

  const [brandId, categoryId, slug] = await Promise.all([
    ensureBrandId(payload.brand),
    ensureRootCategoryId(payload.category),
    resolveUniqueProductSlug(payload.name, productId),
  ]);

  await prisma.$transaction(async (transaction) => {
    await transaction.product.update({
      where: { id: productId },
      data: {
        name: payload.name,
        slug,
        price: payload.price.toFixed(2),
        stockQuantity: payload.stock,
        status: toProductStatus(payload.status),
        brandId,
        categoryId,
      },
    });

    await transaction.productImage.deleteMany({
      where: { productId },
    });

    await transaction.productImage.createMany({
      data: buildImageRows(productId, payload.name, payload.imageUrls),
    });
  });
}

export async function archiveAdminProduct(productId: string): Promise<void> {
  const result = await prisma.product.updateMany({
    where: { id: productId },
    data: { status: ProductStatus.ARCHIVED },
  });

  if (result.count === 0) {
    throw new Error("Producto no encontrado.");
  }
}

export async function archiveAdminProducts(
  productIds: string[],
): Promise<BulkArchiveAdminProductsResult> {
  const normalizedProductIds = normalizeProductIds(productIds);

  if (normalizedProductIds.length === 0) {
    throw new Error("Debes seleccionar al menos un producto.");
  }

  const existingProducts = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedProductIds,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (existingProducts.length === 0) {
    throw new Error("No se encontraron productos para archivar.");
  }

  const productIdsToArchive = existingProducts
    .filter((product) => product.status !== ProductStatus.ARCHIVED)
    .map((product) => product.id);

  if (productIdsToArchive.length === 0) {
    return {
      matchedCount: existingProducts.length,
      archivedCount: 0,
    };
  }

  const result = await prisma.product.updateMany({
    where: {
      id: {
        in: productIdsToArchive,
      },
    },
    data: {
      status: ProductStatus.ARCHIVED,
    },
  });

  return {
    matchedCount: existingProducts.length,
    archivedCount: result.count,
  };
}

export async function restoreAdminProduct(productId: string): Promise<void> {
  const result = await prisma.product.updateMany({
    where: { id: productId },
    data: { status: ProductStatus.ACTIVE },
  });

  if (result.count === 0) {
    throw new Error("Producto no encontrado.");
  }
}

export async function hardDeleteAdminProduct(productId: string): Promise<void> {
  const result = await prisma.product.deleteMany({
    where: { id: productId },
  });

  if (result.count === 0) {
    throw new Error("Producto no encontrado.");
  }
}

export async function hardDeleteAdminProducts(
  productIds: string[],
): Promise<BulkHardDeleteAdminProductsResult> {
  const normalizedProductIds = normalizeProductIds(productIds);

  if (normalizedProductIds.length === 0) {
    throw new Error("Debes seleccionar al menos un producto.");
  }

  const existingProducts = await prisma.product.findMany({
    where: {
      id: {
        in: normalizedProductIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingProducts.length === 0) {
    throw new Error("No se encontraron productos para eliminar.");
  }

  const existingProductIds = existingProducts.map((product) => product.id);
  const result = await prisma.product.deleteMany({
    where: {
      id: {
        in: existingProductIds,
      },
    },
  });

  return {
    matchedCount: existingProducts.length,
    deletedCount: result.count,
  };
}

export async function importPlaceholderProducts(): Promise<PlaceholderImportResult> {
  let created = 0;
  let skipped = 0;

  for (const placeholder of PLACEHOLDER_IMPORT_PRODUCTS) {
    const slug = slugify(placeholder.name);
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { name: placeholder.name },
        ],
      },
      select: { id: true },
    });

    if (existing) {
      skipped += 1;
      continue;
    }

    await createAdminProduct(placeholder);
    created += 1;
  }

  return { created, skipped };
}
