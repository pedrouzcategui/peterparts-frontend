import "server-only";

import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createUniqueSlug(
  baseValue: string,
  exists: (candidate: string) => Promise<boolean>,
) {
  const fallbackSlug = `item-${randomUUID().slice(0, 8)}`;
  const baseSlug = slugify(baseValue) || fallbackSlug;

  let candidate = baseSlug;
  let suffix = 1;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function getOrCreateBrand(name: string) {
  const trimmedName = name.trim();
  const existingBrand = await prisma.brand.findUnique({
    where: { name: trimmedName },
    select: { id: true, name: true },
  });

  if (existingBrand) {
    return existingBrand;
  }

  const slug = await createUniqueSlug(trimmedName, async (candidate) => {
    const brand = await prisma.brand.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    return Boolean(brand);
  });

  return prisma.brand.create({
    data: {
      name: trimmedName,
      slug,
    },
    select: { id: true, name: true },
  });
}

export async function getOrCreateCategory(name: string) {
  const trimmedName = name.trim();
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: trimmedName,
      parentId: null,
    },
    select: { id: true },
  });

  if (existingCategory) {
    return existingCategory;
  }

  const slug = await createUniqueSlug(trimmedName, async (candidate) => {
    const category = await prisma.category.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    return Boolean(category);
  });

  return prisma.category.create({
    data: {
      name: trimmedName,
      slug,
    },
    select: { id: true },
  });
}