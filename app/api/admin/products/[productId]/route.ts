import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { findAdminManagedCategoryById } from "@/lib/admin-categories";
import { requireAdminApiAccess } from "@/lib/auth/admin";
import {
  createUniqueSlug,
  getOrCreateBrand,
} from "@/lib/admin-catalog";
import { normalizeCategoryLabels } from "@/lib/category-labels";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import { deleteProductImageAssets } from "@/lib/product-image-storage.server";
import {
  normalizeProductColorLabel,
  resolveProductColorValue,
} from "@/lib/product-colors";
import {
  parseAdminProductReviews,
  summarizePublishedProductReviews,
  validateAdminProductReviews,
} from "@/lib/product-reviews";
import { prisma } from "@/lib/prisma";

const STATUS_MAP: Record<string, ProductStatus> = {
  active: ProductStatus.ACTIVE,
  draft: ProductStatus.DRAFT,
  archived: ProductStatus.ARCHIVED,
};

export const runtime = "nodejs";

interface ProductColorInput {
  id: string;
  label: string;
  colorValue: string;
  available: boolean;
}

interface ImageOrderItem {
  id: string;
  kind: "new" | "existing";
  sourceUrl?: string;
}

interface ImageColorAssignmentInput {
  imageId: string;
  appliesToAllColors: boolean;
  colorIds: string[];
}

interface UploadedImageInput {
  id: string;
  url: string;
}

interface FinalImageInput {
  clientId: string;
  url: string;
  altText: string;
}

function getStringField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getStringArrayField(formData: FormData, key: string) {
  const rawValue = getStringField(formData, key);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeProductColors(values: ProductColorInput[]): ProductColorInput[] {
  const uniqueColors = new Map<string, ProductColorInput>();

  for (const value of values) {
    const normalizedLabel = normalizeProductColorLabel(value.label);

    if (!normalizedLabel) {
      continue;
    }

    const key = normalizedLabel.toLocaleLowerCase("es");

    if (!uniqueColors.has(key)) {
      uniqueColors.set(key, {
        id: value.id.trim() || key,
        label: normalizedLabel,
        colorValue: resolveProductColorValue(normalizedLabel, value.colorValue),
        available: value.available,
      });
    }
  }

  return Array.from(uniqueColors.values());
}

function getProductColors(formData: FormData): ProductColorInput[] {
  const rawValue = getStringField(formData, "colors");

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return normalizeProductColors(
      parsedValue
        .filter(
          (value): value is {
            id?: unknown;
            label?: unknown;
            colorValue?: unknown;
            available?: unknown;
          } =>
            Boolean(value) && typeof value === "object",
        )
        .map((value) => ({
          id: typeof value.id === "string" ? value.id : "",
          label: typeof value.label === "string" ? value.label : "",
          colorValue:
            typeof value.colorValue === "string" ? value.colorValue : "",
          available: value.available !== false,
        })),
    );
  } catch {
    return [];
  }
}

function getImageColorAssignments(formData: FormData): ImageColorAssignmentInput[] {
  const rawValue = getStringField(formData, "imageColorAssignments");

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (value): value is {
          imageId?: unknown;
          appliesToAllColors?: unknown;
          colorIds?: unknown;
        } => Boolean(value) && typeof value === "object",
      )
      .map((value) => ({
        imageId: typeof value.imageId === "string" ? value.imageId.trim() : "",
        appliesToAllColors: value.appliesToAllColors !== false,
        colorIds: Array.isArray(value.colorIds)
          ? value.colorIds
              .filter((colorId): colorId is string => typeof colorId === "string")
              .map((colorId) => colorId.trim())
              .filter(Boolean)
          : [],
      }))
      .filter((value) => value.imageId.length > 0);
  } catch {
    return [];
  }
}

function getUploadedImages(formData: FormData): UploadedImageInput[] {
  const rawValue = getStringField(formData, "uploadedImages");

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (value): value is { id?: unknown; url?: unknown } =>
          Boolean(value) && typeof value === "object",
      )
      .map((value) => ({
        id: typeof value.id === "string" ? value.id.trim() : "",
        url: typeof value.url === "string" ? value.url.trim() : "",
      }))
      .filter((value) => value.id.length > 0 && value.url.length > 0);
  } catch {
    return [];
  }
}

function resolveImageColorAssignments(
  rawAssignments: ImageColorAssignmentInput[],
  images: FinalImageInput[],
  colors: ProductColorInput[],
):
  | { assignments: ImageColorAssignmentInput[] }
  | { error: string } {
  if (images.length === 0) {
    return { assignments: [] };
  }

  if (colors.length === 0) {
    return {
      assignments: images.map((image) => ({
        imageId: image.clientId,
        appliesToAllColors: true,
        colorIds: [],
      })),
    };
  }

  const colorIds = new Set(colors.map((color) => color.id));
  const assignmentsByImageId = new Map<string, ImageColorAssignmentInput>();

  for (const assignment of rawAssignments) {
    assignmentsByImageId.set(assignment.imageId, {
      imageId: assignment.imageId,
      appliesToAllColors: assignment.appliesToAllColors,
      colorIds: assignment.appliesToAllColors
        ? []
        : Array.from(new Set(assignment.colorIds)),
    });
  }

  const assignments: ImageColorAssignmentInput[] = images.map((image) => {
    const assignment = assignmentsByImageId.get(image.clientId);

    if (!assignment || assignment.appliesToAllColors) {
      return {
        imageId: image.clientId,
        appliesToAllColors: true,
        colorIds: [],
      };
    }

    const validColorIds = assignment.colorIds.filter((colorId) =>
      colorIds.has(colorId),
    );

    return {
      imageId: image.clientId,
      appliesToAllColors: false,
      colorIds: validColorIds,
    };
  });

  const invalidSpecificImage = assignments.find(
    (assignment) =>
      !assignment.appliesToAllColors && assignment.colorIds.length === 0,
  );

  if (invalidSpecificImage) {
    return {
      error:
        "Cada imagen especifica debe estar asociada al menos a un color valido.",
    };
  }

  if (!assignments.some((assignment) => assignment.appliesToAllColors)) {
    const uncoveredColors = colors.filter(
      (color) =>
        !assignments.some((assignment) => assignment.colorIds.includes(color.id)),
    );

    if (uncoveredColors.length > 0) {
      return {
        error: `Cada color debe tener al menos una imagen asignada o existir una imagen global. Faltan: ${uncoveredColors
          .map((color) => color.label)
          .join(", ")}.`,
      };
    }
  }

  return { assignments };
}

async function createImageVariantAssignments(
  transaction: Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
  images: Array<{ clientId: string; id: string }>,
  colors: Array<{ clientId: string; id: string }>,
  assignments: ImageColorAssignmentInput[],
) {
  const imageIdsByClientId = new Map(images.map((image) => [image.clientId, image.id]));
  const colorIdsByClientId = new Map(colors.map((color) => [color.clientId, color.id]));
  const rows = assignments.flatMap((assignment) => {
    if (assignment.appliesToAllColors) {
      return [];
    }

    const productImageId = imageIdsByClientId.get(assignment.imageId);

    if (!productImageId) {
      return [];
    }

    return assignment.colorIds
      .map((colorId) => colorIdsByClientId.get(colorId))
      .filter((productVariantId): productVariantId is string => Boolean(productVariantId))
      .map((productVariantId) => ({
        productImageId,
        productVariantId,
      }));
  });

  if (rows.length === 0) {
    return;
  }

  await transaction.productImageVariantAssignment.createMany({
    data: rows,
  });
}

function getImageOrder(formData: FormData): ImageOrderItem[] {
  const rawValue = getStringField(formData, "imageOrder");

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (value): value is { id?: unknown; kind?: unknown; sourceUrl?: unknown } =>
          Boolean(value) && typeof value === "object",
      )
      .map((value): ImageOrderItem => {
        const kind: ImageOrderItem["kind"] =
          value.kind === "existing" ? "existing" : "new";

        return {
          id: typeof value.id === "string" ? value.id.trim() : "",
          kind,
          sourceUrl:
            typeof value.sourceUrl === "string" ? value.sourceUrl.trim() : undefined,
        };
      })
      .filter((value) => value.id.length > 0);
  } catch {
    return [];
  }
}

function resolvePrimaryColor(
  colors: ProductColorInput[],
  requestedPrimaryColor: string,
): ProductColorInput | null {
  if (colors.length === 0) {
    return null;
  }

  const normalizedRequestedColor = normalizeProductColorLabel(
    requestedPrimaryColor,
  ).toLocaleLowerCase("es");

  if (normalizedRequestedColor) {
    const requestedColor = colors.find(
      (color) => color.label.toLocaleLowerCase("es") === normalizedRequestedColor,
    );

    if (requestedColor) {
      return requestedColor;
    }
  }

  const firstAvailableColor = colors.find((color) => color.available);

  return firstAvailableColor ?? colors[0] ?? null;
}

function getRetainedImageUrls(formData: FormData) {
  return getStringArrayField(formData, "retainedImageUrls");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/products");

  if (!access.ok) {
    return access.response;
  }

  const productId = (await params).productId;
  const formData = await request.formData();

  const name = getStringField(formData, "name");
  const brand = getStringField(formData, "brand");
  const primaryCategoryId = getStringField(formData, "primaryCategoryId");
  const categoryLabels = getStringArrayField(formData, "categoryLabels");
  const description = getStringField(formData, "description");
  const statusValue = getStringField(formData, "status");
  const featuredRankValue = getStringField(formData, "featuredRank");
  const priceUsdValue = getStringField(formData, "priceUsd");
  const priceVesValue = getStringField(formData, "priceVes");
  const stockValue = getStringField(formData, "stock");
  const uploadedImages = getUploadedImages(formData);
  const imageOrder = getImageOrder(formData);
  const requestedPrimaryColor = getStringField(formData, "primaryColor");
  const productColors = getProductColors(formData);
  const rawImageColorAssignments = getImageColorAssignments(formData);
  const productReviews = parseAdminProductReviews(
    getStringField(formData, "reviews"),
  );

  if (!name) {
    return NextResponse.json(
      { message: "El nombre del producto es obligatorio." },
      { status: 400 },
    );
  }

  if (!brand) {
    return NextResponse.json(
      { message: "La marca del producto es obligatoria." },
      { status: 400 },
    );
  }

  if (!primaryCategoryId) {
    return NextResponse.json(
      { message: "Debes seleccionar una categoria principal." },
      { status: 400 },
    );
  }

  if (!description) {
    return NextResponse.json(
      { message: "La descripcion del producto es obligatoria." },
      { status: 400 },
    );
  }

  const reviewsValidationError = validateAdminProductReviews(productReviews);

  if (reviewsValidationError) {
    return NextResponse.json(
      { message: reviewsValidationError },
      { status: 400 },
    );
  }

  const priceUsd = Number(priceUsdValue);
  const priceVes = Number(priceVesValue);
  const stock = Number.parseInt(stockValue, 10);
  const status = STATUS_MAP[statusValue];
  const categoryRecord = await findAdminManagedCategoryById(primaryCategoryId);
  let featuredRank: number | null = null;

  if (featuredRankValue) {
    if (!/^[1-9]\d*$/.test(featuredRankValue)) {
      return NextResponse.json(
        { message: "El orden destacado debe ser un numero entero mayor a cero." },
        { status: 400 },
      );
    }

    featuredRank = Number.parseInt(featuredRankValue, 10);
  }

  if (!Number.isFinite(priceUsd) || priceUsd < 0) {
    return NextResponse.json(
      { message: "El precio USD debe ser un numero valido." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(priceVes) || priceVes < 0) {
    return NextResponse.json(
      { message: "El precio VES debe ser un numero valido." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return NextResponse.json(
      {
        message:
          "El inventario debe ser un numero entero mayor o igual a cero.",
      },
      { status: 400 },
    );
  }

  if (!status) {
    return NextResponse.json(
      { message: "El estado seleccionado no es valido." },
      { status: 400 },
    );
  }

  if (!categoryRecord) {
    return NextResponse.json(
      { message: "La categoria principal seleccionada no es valida." },
      { status: 400 },
    );
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          url: true,
          altText: true,
        },
      },
    },
  });

  if (!existingProduct) {
    return NextResponse.json(
      { message: "Producto no encontrado." },
      { status: 404 },
    );
  }

  const allowedRetainedUrls = new Set(existingProduct.images.map((image) => image.url));
  const retainedImageUrls = getRetainedImageUrls(formData).filter((url) =>
    allowedRetainedUrls.has(url),
  );

  if (retainedImageUrls.length + uploadedImages.length === 0) {
    return NextResponse.json(
      { message: "Debes conservar o subir al menos una imagen del producto." },
      { status: 400 },
    );
  }

  const productSlug = await createUniqueSlug(name, async (candidate) => {
    const product = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    return Boolean(product && product.id !== productId);
  });

  try {
    const [brandRecord] = await Promise.all([
      getOrCreateBrand(brand),
    ]);

    const existingImageMap = new Map(
      existingProduct.images.map((image) => [image.url, image]),
    );
    const existingImageIdsByUrl = new Map(
      imageOrder
        .filter((item) => item.kind === "existing" && item.sourceUrl)
        .map((item) => [item.sourceUrl as string, item.id]),
    );
    const uploadedImagesById = new Map(
      uploadedImages.map((image) => [image.id, image]),
    );
    const finalImages: FinalImageInput[] = [];
    const includedExistingUrls = new Set<string>();
    const includedUploadedIds = new Set<string>();

    if (imageOrder.length > 0) {
      for (const item of imageOrder) {
        if (
          item.kind === "existing" &&
          item.sourceUrl &&
          retainedImageUrls.includes(item.sourceUrl) &&
          !includedExistingUrls.has(item.sourceUrl)
        ) {
          finalImages.push({
            clientId: item.id,
            url: item.sourceUrl,
            altText:
              existingImageMap.get(item.sourceUrl)?.altText ??
              `${name} imagen ${finalImages.length + 1}`,
          });
          includedExistingUrls.add(item.sourceUrl);
          continue;
        }

        if (item.kind === "new") {
          const uploadedFile = uploadedImagesById.get(item.id);

          if (uploadedFile && !includedUploadedIds.has(uploadedFile.id)) {
            finalImages.push({
              clientId: item.id,
              url: uploadedFile.url,
              altText: `${name} imagen ${finalImages.length + 1}`,
            });
            includedUploadedIds.add(uploadedFile.id);
          }
        }
      }
    }

    for (const retainedImageUrl of retainedImageUrls) {
      if (!includedExistingUrls.has(retainedImageUrl)) {
        finalImages.push({
          clientId:
            existingImageIdsByUrl.get(retainedImageUrl) ??
            `existing-${retainedImageUrl}`,
          url: retainedImageUrl,
          altText:
            existingImageMap.get(retainedImageUrl)?.altText ??
            `${name} imagen ${finalImages.length + 1}`,
        });
        includedExistingUrls.add(retainedImageUrl);
      }
    }

    for (const uploadedFile of uploadedImages) {
      if (!includedUploadedIds.has(uploadedFile.id)) {
        finalImages.push({
          clientId: uploadedFile.id,
          url: uploadedFile.url,
          altText: `${name} imagen ${finalImages.length + 1}`,
        });
        includedUploadedIds.add(uploadedFile.id);
      }
    }

    const primaryColor = resolvePrimaryColor(productColors, requestedPrimaryColor);
    const reviewSummary = summarizePublishedProductReviews(productReviews);
    const resolvedAssignments = resolveImageColorAssignments(
      rawImageColorAssignments,
      finalImages,
      productColors,
    );

    if ("error" in resolvedAssignments) {
      return NextResponse.json(
        { message: resolvedAssignments.error },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.product.update({
        where: { id: productId },
        data: {
          slug: productSlug,
          name,
          description,
          categoryLabels: normalizeCategoryLabels(
            categoryRecord.name,
            categoryLabels,
          ),
          price: priceUsd.toFixed(2),
          priceVes: priceVes.toFixed(2),
          primaryColor: primaryColor?.label ?? null,
          primaryColorValue: primaryColor?.colorValue ?? null,
          stockQuantity: stock,
          status,
          featuredRank,
          averageRating: reviewSummary.averageRating.toFixed(2),
          reviewCount: reviewSummary.reviewCount,
          brandId: brandRecord.id,
          categoryId: categoryRecord.id,
        },
      });

      await transaction.productReview.deleteMany({
        where: { productId },
      });

      await transaction.productVariant.deleteMany({
        where: { productId },
      });

      await transaction.productImage.deleteMany({
        where: { productId },
      });

      const createdVariants: Array<{ clientId: string; id: string }> = [];

      for (const [index, color] of productColors.entries()) {
        const variant = await transaction.productVariant.create({
          data: {
            productId,
            label: color.label,
            colorValue: color.colorValue,
            available: color.available,
            sortOrder: index,
          },
          select: {
            id: true,
          },
        });

        createdVariants.push({
          clientId: color.id,
          id: variant.id,
        });
      }

      const createdImages: Array<{ clientId: string; id: string }> = [];

      for (const [index, image] of finalImages.entries()) {
        const createdImage = await transaction.productImage.create({
          data: {
            productId,
            url: image.url,
            altText: image.altText,
            sortOrder: index,
            isPrimary: index === 0,
          },
          select: {
            id: true,
          },
        });

        createdImages.push({
          clientId: image.clientId,
          id: createdImage.id,
        });
      }

      if (productReviews.length > 0) {
        await transaction.productReview.createMany({
          data: productReviews.map((review) => ({
            productId,
            reviewerName: review.reviewerName,
            title: review.title || null,
            body: review.body || null,
            rating: review.rating,
            isPublished: review.isPublished,
            createdAt: new Date(review.createdAt),
          })),
        });
      }

      await createImageVariantAssignments(
        transaction,
        createdImages,
        createdVariants,
        resolvedAssignments.assignments,
      );
    });

    const removedUrls = existingProduct.images
      .map((image) => image.url)
      .filter((url) => !retainedImageUrls.includes(url));

    await deleteProductImageAssets(removedUrls).catch(() => undefined);

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${productSlug}`);
    if (existingProduct.slug !== productSlug) {
      revalidatePath(`/products/${existingProduct.slug}`);
    }
    revalidatePath(`/admin/products/${productId}/edit`);

    return NextResponse.json(
      { message: "Producto actualizado correctamente." },
      { status: 200 },
    );
  } catch (error) {
    await deleteProductImageAssets(
      uploadedImages.map((image) => image.url),
    ).catch(() => undefined);

    const message =
      error instanceof Error ? error.message : "No se pudo actualizar el producto.";

    return NextResponse.json(
      {
        message,
        resetUploadedImages: uploadedImages.length > 0,
      },
      { status: 500 },
    );
  }
}