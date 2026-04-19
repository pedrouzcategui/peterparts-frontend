import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/auth/admin";
import { findAdminManagedCategoryById } from "@/lib/admin-categories";
import {
  createUniqueSlug,
  getOrCreateBrand,
} from "@/lib/admin-catalog";
import { normalizeCategoryLabels } from "@/lib/category-labels";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import {
  normalizeProductColorLabel,
  resolveProductColorValue,
} from "@/lib/product-colors";
import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

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

interface FinalImageInput {
  clientId: string;
  url: string;
  altText: string;
}

async function createUniqueSku() {
  let candidate = "";

  do {
    candidate = `PP-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`;
  } while (
    await prisma.product.findUnique({
      where: { sku: candidate },
      select: { id: true },
    })
  );

  return candidate;
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
    const uniqueColorIds = Array.from(new Set(assignment.colorIds));

    assignmentsByImageId.set(assignment.imageId, {
      imageId: assignment.imageId,
      appliesToAllColors: assignment.appliesToAllColors,
      colorIds: assignment.appliesToAllColors ? [] : uniqueColorIds,
    });
  }

  const assignments = images.map((image) => {
    const assignment = assignmentsByImageId.get(image.clientId);

    if (!assignment || assignment.appliesToAllColors) {
      return {
        imageId: image.clientId,
        appliesToAllColors: true,
        colorIds: [],
      } satisfies ImageColorAssignmentInput;
    }

    const validColorIds = assignment.colorIds.filter((colorId) =>
      colorIds.has(colorId),
    );

    return {
      imageId: image.clientId,
      appliesToAllColors: false,
      colorIds: validColorIds,
    } satisfies ImageColorAssignmentInput;
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

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function saveImages(
  files: File[],
  productSlug: string,
  imageIds: string[],
) {
  const uploadDirectory = path.join(
    process.cwd(),
    "public",
    "products",
    "uploads",
  );

  await mkdir(uploadDirectory, { recursive: true });

  const uploads = await Promise.all(
    files.map(async (file, index) => {
      const imageId = imageIds[index];
      const extension = IMAGE_EXTENSIONS.get(file.type);

      if (!imageId) {
        throw new Error("No pudimos identificar una de las imagenes cargadas.");
      }

      if (!extension) {
        throw new Error(`El archivo ${file.name} no es una imagen compatible.`);
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(`La imagen ${file.name} supera el limite de 5 MB.`);
      }

      const fileName = `${productSlug}-${index + 1}-${randomUUID().slice(0, 8)}.${extension}`;
      const filePath = path.join(uploadDirectory, fileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await writeFile(filePath, fileBuffer);

      return {
        id: imageId,
        filePath,
        url: `/products/uploads/${fileName}`,
      };
    }),
  );

  return uploads;
}

export async function POST(request: Request) {
  const access = await requireAdminApiAccess("/admin/products");

  if (!access.ok) {
    return access.response;
  }

  const formData = await request.formData();

  const name = getStringField(formData, "name");
  const brand = getStringField(formData, "brand");
  const primaryCategoryId = getStringField(formData, "primaryCategoryId");
  const categoryLabels = getStringArrayField(formData, "categoryLabels");
  const description = getStringField(formData, "description");
  const statusValue = getStringField(formData, "status");
  const featuredRankValue = getStringField(formData, "featuredRank");
  const priceUsdValue =
    getStringField(formData, "priceUsd") || getStringField(formData, "price");
  const priceVesValue = getStringField(formData, "priceVes");
  const stockValue = getStringField(formData, "stock");
  const imageFiles = getImageFiles(formData);
  const imageOrder = getImageOrder(formData);
  const requestedPrimaryColor = getStringField(formData, "primaryColor");
  const productColors = getProductColors(formData);
  const newImageIds = getStringArrayField(formData, "newImageIds");
  const rawImageColorAssignments = getImageColorAssignments(formData);

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

  if (imageFiles.length === 0) {
    return NextResponse.json(
      { message: "Debes subir al menos una imagen del producto." },
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

  const productSlug = await createUniqueSlug(name, async (candidate) => {
    const product = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    return Boolean(product);
  });

  const uploadedFiles: Awaited<ReturnType<typeof saveImages>> = [];

  try {
    const [brandRecord, sku] = await Promise.all([
      getOrCreateBrand(brand),
      createUniqueSku(),
    ]);

    const effectiveNewImageIds =
      newImageIds.length === imageFiles.length
        ? newImageIds
        : imageFiles.map((_, index) => `new-image-${index}`);

    uploadedFiles.push(...(await saveImages(imageFiles, productSlug, effectiveNewImageIds)));

    const uploadedFilesById = new Map(
      uploadedFiles.map((file) => [file.id, file]),
    );
    const orderedUploadedFiles =
      imageOrder.length > 0
        ? imageOrder
            .filter((item) => item.kind === "new")
            .map((item) => uploadedFilesById.get(item.id))
            .filter((file): file is (typeof uploadedFiles)[number] => Boolean(file))
        : [];
    const usedUploadedIds = new Set(orderedUploadedFiles.map((file) => file.id));
    const finalUploadedFiles = [
      ...orderedUploadedFiles,
      ...uploadedFiles.filter((file) => !usedUploadedIds.has(file.id)),
    ];
    const primaryColor = resolvePrimaryColor(productColors, requestedPrimaryColor);
    const finalImages: FinalImageInput[] = finalUploadedFiles.map((file, index) => ({
      clientId: file.id,
      url: file.url,
      altText: `${name} imagen ${index + 1}`,
    }));
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

    const createdProduct = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.create({
        data: {
          sku,
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
          brandId: brandRecord.id,
          categoryId: categoryRecord.id,
          shippingInfo: "Envio a coordinar segun la zona.",
          features: [],
        },
        select: {
          id: true,
          slug: true,
        },
      });

      const createdVariants: Array<{ clientId: string; id: string }> = [];

      for (const [index, color] of productColors.entries()) {
        const variant = await transaction.productVariant.create({
          data: {
            productId: product.id,
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
            productId: product.id,
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

      await createImageVariantAssignments(
        transaction,
        createdImages,
        createdVariants,
        resolvedAssignments.assignments,
      );

      return product;
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json(
      {
        product: createdProduct,
        message: "Producto creado correctamente.",
      },
      { status: 201 },
    );
  } catch (error) {
    await Promise.all(
      uploadedFiles.map(async (file) => {
        await unlink(file.filePath).catch(() => undefined);
      }),
    );

    const message =
      error instanceof Error ? error.message : "No se pudo crear el producto.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
