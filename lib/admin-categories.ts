import "server-only";

import { cache } from "react";
import type {
  AdminManagedCategory,
  AdminManagedCategoryOption,
} from "@/lib/admin-data";
import { createUniqueSlug, slugify } from "@/lib/admin-catalog";
import { prisma } from "@/lib/prisma";

type CategoryRecordWithCounts = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
    children: number;
  };
};

interface AdminCategoryWriteInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
}

export class AdminCategoryValidationError extends Error {}
export class AdminCategoryConflictError extends Error {}
export class AdminCategoryDeleteBlockedError extends Error {}
export class AdminCategoryNotFoundError extends Error {}

const categoryListSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  parentId: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
      children: true,
    },
  },
} as const;

const categoryOptionSelect = {
  id: true,
  name: true,
  slug: true,
} as const;

function normalizeCategoryName(name: string): string {
  const normalizedName = name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    throw new AdminCategoryValidationError(
      "El nombre de la categoria es obligatorio.",
    );
  }

  return normalizedName;
}

function normalizeCategoryDescription(description?: string): string {
  return description?.trim() ?? "";
}

async function ensureTopLevelCategoryNameIsUnique(
  name: string,
  categoryIdToIgnore?: string,
): Promise<void> {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
      ...(categoryIdToIgnore
        ? {
            NOT: {
              id: categoryIdToIgnore,
            },
          }
        : {}),
    },
    select: {
      name: true,
    },
  });

  const normalizedName = name.toLocaleLowerCase("es");
  const duplicate = categories.some(
    (category) => category.name.toLocaleLowerCase("es") === normalizedName,
  );

  if (duplicate) {
    throw new AdminCategoryConflictError(
      "Ya existe una categoria con ese nombre.",
    );
  }
}

async function resolveManagedCategorySlug(
  name: string,
  requestedSlug: string | undefined,
  categoryIdToIgnore?: string,
): Promise<string> {
  const normalizedRequestedSlug = requestedSlug?.trim() ?? "";

  if (!normalizedRequestedSlug) {
    return createUniqueSlug(name, async (candidate) => {
      const category = await prisma.category.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      return Boolean(category && category.id !== categoryIdToIgnore);
    });
  }

  const normalizedSlug = slugify(normalizedRequestedSlug);

  if (!normalizedSlug) {
    throw new AdminCategoryValidationError(
      "Ingresa un slug valido para la categoria.",
    );
  }

  const existingCategory = await prisma.category.findUnique({
    where: { slug: normalizedSlug },
    select: { id: true },
  });

  if (existingCategory && existingCategory.id !== categoryIdToIgnore) {
    throw new AdminCategoryConflictError(
      "Ya existe una categoria con ese slug.",
    );
  }

  return normalizedSlug;
}

function assertTopLevelOnly(parentId?: string | null) {
  if (parentId) {
    throw new AdminCategoryValidationError(
      "Las subcategorias aun no estan disponibles en administracion.",
    );
  }
}

function mapManagedCategory(
  category: CategoryRecordWithCounts,
): AdminManagedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    productsCount: category._count.products,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export const getAdminManagedCategories = cache(
  async (): Promise<AdminManagedCategory[]> => {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      select: categoryListSelect,
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((category) =>
      mapManagedCategory(category as CategoryRecordWithCounts),
    );
  },
);

export const getAdminManagedCategoryOptions = cache(
  async (): Promise<AdminManagedCategoryOption[]> => {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      select: categoryOptionSelect,
      orderBy: {
        name: "asc",
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      displayName: category.name,
    }));
  },
);

export async function findAdminManagedCategoryById(categoryId: string) {
  if (!categoryId) {
    return null;
  }

  return prisma.category.findFirst({
    where: {
      id: categoryId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function createAdminManagedCategory(
  input: AdminCategoryWriteInput,
): Promise<AdminManagedCategory> {
  assertTopLevelOnly(input.parentId);

  const name = normalizeCategoryName(input.name);
  const description = normalizeCategoryDescription(input.description);

  await ensureTopLevelCategoryNameIsUnique(name);
  const resolvedSlug = await resolveManagedCategorySlug(name, input.slug);

  const category = await prisma.category.create({
    data: {
      name,
      slug: resolvedSlug,
      description: description || null,
    },
    select: categoryListSelect,
  });

  return mapManagedCategory(category as CategoryRecordWithCounts);
}

export async function updateAdminManagedCategory(
  categoryId: string,
  input: AdminCategoryWriteInput,
): Promise<AdminManagedCategory> {
  assertTopLevelOnly(input.parentId);

  const existingCategory = await prisma.category.findFirst({
    where: {
      id: categoryId,
      parentId: null,
    },
    select: {
      id: true,
    },
  });

  if (!existingCategory) {
    throw new AdminCategoryNotFoundError("Categoria no encontrada.");
  }

  const name = normalizeCategoryName(input.name);
  const description = normalizeCategoryDescription(input.description);

  await ensureTopLevelCategoryNameIsUnique(name, categoryId);
  const resolvedSlug = await resolveManagedCategorySlug(
    name,
    input.slug,
    categoryId,
  );

  const category = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
      slug: resolvedSlug,
      description: description || null,
    },
    select: categoryListSelect,
  });

  return mapManagedCategory(category as CategoryRecordWithCounts);
}

export async function deleteAdminManagedCategory(categoryId: string) {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: categoryListSelect,
  });

  if (!category || category.parentId !== null) {
    throw new AdminCategoryNotFoundError("Categoria no encontrada.");
  }

  if (category._count.children > 0) {
    throw new AdminCategoryDeleteBlockedError(
      "No puedes eliminar una categoria que tiene subcategorias asociadas.",
    );
  }

  if (category._count.products > 0) {
    throw new AdminCategoryDeleteBlockedError(
      "No puedes eliminar una categoria con productos asignados.",
    );
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
}