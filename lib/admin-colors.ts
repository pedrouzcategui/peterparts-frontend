import "server-only";

import { cache } from "react";
import type {
  AdminColorSuggestion,
  AdminManagedColor,
  AdminManagedColorProduct,
} from "@/lib/admin-data";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import {
  PREDEFINED_PRODUCT_COLORS,
  normalizeProductColorLabel,
  normalizeProductColorValue,
  resolveProductColorValue,
} from "@/lib/product-colors";
import { prisma } from "@/lib/prisma";

interface AdminColorWriteInput {
  label: string;
  colorValue: string;
  isBasePalette?: boolean;
}

interface CatalogColorRecord {
  id: string;
  label: string;
  normalizedLabel: string;
  colorValue: string;
  isBasePalette: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariantUsageRecord {
  id: string;
  label: string;
  colorValue: string;
  available: boolean;
}

interface ProductColorUsageRecord {
  id: string;
  name: string;
  status: ProductStatus;
  primaryColor: string | null;
  primaryColorValue: string | null;
  brand: {
    name: string;
  };
  variants: ProductVariantUsageRecord[];
}

interface NormalizedAdminColorInput {
  label: string;
  normalizedLabel: string;
  colorValue: string;
  isBasePalette: boolean;
}

export class AdminColorValidationError extends Error {}
export class AdminColorConflictError extends Error {}
export class AdminColorDeleteBlockedError extends Error {}
export class AdminColorNotFoundError extends Error {}

function buildColorKey(label: string) {
  return normalizeProductColorLabel(label).toLocaleLowerCase("es");
}

function buildNormalizedLabel(label: string) {
  const normalizedLabel = normalizeProductColorLabel(label);

  if (!normalizedLabel) {
    throw new AdminColorValidationError("El nombre del color es obligatorio.");
  }

  return normalizedLabel;
}

function normalizeAdminColorInput(
  input: AdminColorWriteInput,
): NormalizedAdminColorInput {
  const label = buildNormalizedLabel(input.label);
  const normalizedLabel = buildColorKey(label);
  const normalizedColorValue = normalizeProductColorValue(input.colorValue);

  if (!normalizedColorValue) {
    throw new AdminColorValidationError(
      "Ingresa un color hexadecimal valido, por ejemplo #c61c31.",
    );
  }

  return {
    label,
    normalizedLabel,
    colorValue: normalizedColorValue,
    isBasePalette: input.isBasePalette === true,
  };
}

function mapAdminStatus(
  status: ProductStatus,
): AdminManagedColorProduct["status"] {
  switch (status) {
    case ProductStatus.ACTIVE:
      return "active";
    case ProductStatus.ARCHIVED:
      return "archived";
    case ProductStatus.DRAFT:
      return "draft";
  }
}

function sortColorSuggestions(values: AdminColorSuggestion[]) {
  return [...values].sort((left, right) =>
    left.label.localeCompare(right.label, "es"),
  );
}

function sortManagedColorProducts(values: AdminManagedColorProduct[]) {
  return [...values].sort((left, right) =>
    left.name.localeCompare(right.name, "es"),
  );
}

function sortManagedColors(values: AdminManagedColor[]) {
  return [...values].sort((left, right) => {
    if (left.productsCount === 0 && right.productsCount > 0) {
      return 1;
    }

    if (left.productsCount > 0 && right.productsCount === 0) {
      return -1;
    }

    return left.label.localeCompare(right.label, "es");
  });
}

function createEmptyManagedColor(color: CatalogColorRecord): AdminManagedColor {
  return {
    id: color.id,
    label: color.label,
    colorValue: color.colorValue,
    isPredefined: color.isBasePalette,
    productsCount: 0,
    variantCount: 0,
    availableVariantCount: 0,
    primaryProductsCount: 0,
    products: [],
  };
}

async function listCatalogColorRecords(): Promise<CatalogColorRecord[]> {
  return prisma.catalogColor.findMany({
    select: {
      id: true,
      label: true,
      normalizedLabel: true,
      colorValue: true,
      isBasePalette: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ isBasePalette: "desc" }, { label: "asc" }],
  });
}

async function listProductColorUsageRecords(): Promise<ProductColorUsageRecord[]> {
  return prisma.product.findMany({
    select: {
      id: true,
      name: true,
      status: true,
      primaryColor: true,
      primaryColorValue: true,
      brand: {
        select: {
          name: true,
        },
      },
      variants: {
        select: {
          id: true,
          label: true,
          colorValue: true,
          available: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: [{ brand: { name: "asc" } }, { name: "asc" }],
  });
}

function collectDetectedColorDefinitions(
  products: ProductColorUsageRecord[],
): NormalizedAdminColorInput[] {
  const colorsByKey = new Map<string, NormalizedAdminColorInput>();

  const registerColor = (
    label: string | null | undefined,
    colorValue?: string | null,
    isBasePalette = false,
  ) => {
    const normalizedLabel = normalizeProductColorLabel(label ?? "");

    if (!normalizedLabel) {
      return;
    }

    const key = buildColorKey(normalizedLabel);

    if (colorsByKey.has(key)) {
      return;
    }

    colorsByKey.set(key, {
      label: normalizedLabel,
      normalizedLabel: key,
      colorValue: resolveProductColorValue(normalizedLabel, colorValue),
      isBasePalette,
    });
  };

  for (const color of PREDEFINED_PRODUCT_COLORS) {
    registerColor(color.label, color.colorValue, true);
  }

  for (const product of products) {
    registerColor(product.primaryColor, product.primaryColorValue);

    for (const variant of product.variants) {
      registerColor(variant.label, variant.colorValue);
    }
  }

  return Array.from(colorsByKey.values());
}

async function ensureCatalogColorsReady() {
  const products = await listProductColorUsageRecords();
  const detectedColors = collectDetectedColorDefinitions(products);
  const existingColors = await prisma.catalogColor.findMany({
    select: {
      normalizedLabel: true,
    },
  });

  const existingKeys = new Set(existingColors.map((color) => color.normalizedLabel));
  const missingColors = detectedColors.filter(
    (color) => !existingKeys.has(color.normalizedLabel),
  );

  if (missingColors.length > 0) {
    await prisma.catalogColor.createMany({
      data: missingColors.map((color) => ({
        label: color.label,
        normalizedLabel: color.normalizedLabel,
        colorValue: color.colorValue,
        isBasePalette: color.isBasePalette,
      })),
      skipDuplicates: true,
    });
  }

  return products;
}

function buildManagedColors(
  catalogColors: CatalogColorRecord[],
  products: ProductColorUsageRecord[],
): AdminManagedColor[] {
  const colorsByKey = new Map<
    string,
    AdminManagedColor & { productsById: Map<string, AdminManagedColorProduct> }
  >();

  for (const color of catalogColors) {
    colorsByKey.set(color.normalizedLabel, {
      ...createEmptyManagedColor(color),
      productsById: new Map<string, AdminManagedColorProduct>(),
    });
  }

  for (const product of products) {
    const productSummary = {
      id: product.id,
      name: product.name,
      brand: product.brand.name,
      status: mapAdminStatus(product.status),
    } satisfies AdminManagedColorProduct;

    const registerProductUsage = (
      label: string | null | undefined,
      options?: {
        countsAsVariant?: boolean;
        countsAsAvailable?: boolean;
        countsAsPrimary?: boolean;
      },
    ) => {
      const normalizedLabel = normalizeProductColorLabel(label ?? "");

      if (!normalizedLabel) {
        return;
      }

      const color = colorsByKey.get(buildColorKey(normalizedLabel));

      if (!color) {
        return;
      }

      if (!color.productsById.has(product.id)) {
        color.productsById.set(product.id, productSummary);
        color.productsCount += 1;
      }

      if (options?.countsAsVariant) {
        color.variantCount += 1;
      }

      if (options?.countsAsAvailable) {
        color.availableVariantCount += 1;
      }

      if (options?.countsAsPrimary) {
        color.primaryProductsCount += 1;
      }
    };

    for (const variant of product.variants) {
      registerProductUsage(variant.label, {
        countsAsVariant: true,
        countsAsAvailable: variant.available,
      });
    }

    registerProductUsage(product.primaryColor, {
      countsAsPrimary: true,
    });
  }

  return sortManagedColors(
    Array.from(colorsByKey.values()).map(({ productsById, ...color }) => ({
      ...color,
      products: sortManagedColorProducts(Array.from(productsById.values())),
    })),
  );
}

async function listManagedColors(): Promise<AdminManagedColor[]> {
  const products = await ensureCatalogColorsReady();
  const catalogColors = await listCatalogColorRecords();

  return buildManagedColors(catalogColors, products);
}

async function getManagedColorById(colorId: string): Promise<AdminManagedColor | null> {
  if (!colorId.trim()) {
    return null;
  }

  const colors = await listManagedColors();

  return colors.find((color) => color.id === colorId) ?? null;
}

async function ensureColorLabelIsAvailable(
  normalizedLabel: string,
  colorIdToIgnore?: string,
) {
  const existingColor = await prisma.catalogColor.findUnique({
    where: {
      normalizedLabel,
    },
    select: {
      id: true,
    },
  });

  if (existingColor && existingColor.id !== colorIdToIgnore) {
    throw new AdminColorConflictError(
      "Ya existe un color con ese nombre en la biblioteca.",
    );
  }
}

function colorLabelMatches(
  label: string | null | undefined,
  normalizedLabel: string,
) {
  const normalizedValue = normalizeProductColorLabel(label ?? "");

  return Boolean(normalizedValue) && buildColorKey(normalizedValue) === normalizedLabel;
}

function assertNoVariantRenameConflicts(
  products: ProductColorUsageRecord[],
  currentNormalizedLabel: string,
  nextNormalizedLabel: string,
) {
  if (currentNormalizedLabel === nextNormalizedLabel) {
    return;
  }

  for (const product of products) {
    const matchingVariants = product.variants.filter((variant) =>
      colorLabelMatches(variant.label, currentNormalizedLabel),
    );

    if (matchingVariants.length === 0) {
      continue;
    }

    if (matchingVariants.length > 1) {
      throw new AdminColorConflictError(
        `No se puede renombrar este color porque ${product.name} tiene variantes duplicadas para ese tono.`,
      );
    }

    const conflictingVariant = product.variants.find(
      (variant) =>
        !colorLabelMatches(variant.label, currentNormalizedLabel) &&
        colorLabelMatches(variant.label, nextNormalizedLabel),
    );

    if (conflictingVariant) {
      throw new AdminColorConflictError(
        `No se puede renombrar este color porque ${product.name} ya usa ${conflictingVariant.label} como variante.`,
      );
    }
  }
}

export const getAdminManagedColors = cache(listManagedColors);

export const getAdminColorSuggestions = cache(
  async (): Promise<AdminColorSuggestion[]> => {
    await ensureCatalogColorsReady();
    const colors = await prisma.catalogColor.findMany({
      select: {
        label: true,
        colorValue: true,
      },
      orderBy: [{ isBasePalette: "desc" }, { label: "asc" }],
    });

    return sortColorSuggestions(
      colors.map((color) => ({
        label: color.label,
        colorValue: color.colorValue,
      })),
    );
  },
);

export async function createAdminManagedColor(
  input: AdminColorWriteInput,
): Promise<AdminManagedColor> {
  const payload = normalizeAdminColorInput(input);

  await ensureColorLabelIsAvailable(payload.normalizedLabel);

  const color = await prisma.catalogColor.create({
    data: payload,
    select: {
      id: true,
    },
  });

  return (
    (await getManagedColorById(color.id)) ?? {
      id: color.id,
      label: payload.label,
      colorValue: payload.colorValue,
      isPredefined: payload.isBasePalette,
      productsCount: 0,
      variantCount: 0,
      availableVariantCount: 0,
      primaryProductsCount: 0,
      products: [],
    }
  );
}

export async function updateAdminManagedColor(
  colorId: string,
  input: AdminColorWriteInput,
): Promise<AdminManagedColor> {
  const normalizedColorId = colorId.trim();

  if (!normalizedColorId) {
    throw new AdminColorNotFoundError("Color no encontrado.");
  }

  const existingColor = await prisma.catalogColor.findUnique({
    where: {
      id: normalizedColorId,
    },
    select: {
      id: true,
      label: true,
      normalizedLabel: true,
      colorValue: true,
      isBasePalette: true,
    },
  });

  if (!existingColor) {
    throw new AdminColorNotFoundError("Color no encontrado.");
  }

  const payload = normalizeAdminColorInput(input);

  await ensureColorLabelIsAvailable(payload.normalizedLabel, existingColor.id);

  const products = await listProductColorUsageRecords();

  assertNoVariantRenameConflicts(
    products,
    existingColor.normalizedLabel,
    payload.normalizedLabel,
  );

  await prisma.$transaction(async (transaction) => {
    await transaction.catalogColor.update({
      where: {
        id: existingColor.id,
      },
      data: payload,
    });

    for (const product of products) {
      if (colorLabelMatches(product.primaryColor, existingColor.normalizedLabel)) {
        await transaction.product.update({
          where: {
            id: product.id,
          },
          data: {
            primaryColor: payload.label,
            primaryColorValue: payload.colorValue,
          },
        });
      }

      for (const variant of product.variants) {
        if (!colorLabelMatches(variant.label, existingColor.normalizedLabel)) {
          continue;
        }

        await transaction.productVariant.update({
          where: {
            id: variant.id,
          },
          data: {
            label: payload.label,
            colorValue: payload.colorValue,
          },
        });
      }
    }
  });

  const updatedColor = await getManagedColorById(existingColor.id);

  if (!updatedColor) {
    throw new AdminColorNotFoundError("Color no encontrado.");
  }

  return updatedColor;
}

export async function deleteAdminManagedColor(colorId: string): Promise<void> {
  const managedColor = await getManagedColorById(colorId.trim());

  if (!managedColor) {
    throw new AdminColorNotFoundError("Color no encontrado.");
  }

  if (managedColor.productsCount > 0) {
    throw new AdminColorDeleteBlockedError(
      "No puedes eliminar un color que todavia esta asignado a productos. Editalo o quitalo primero desde las fichas relacionadas.",
    );
  }

  await prisma.catalogColor.delete({
    where: {
      id: managedColor.id,
    },
  });
}