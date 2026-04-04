import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createUniqueSlug,
  getOrCreateBrand,
  getOrCreateCategory,
} from "@/lib/admin-catalog";
import { ProductStatus } from "@/lib/generated/prisma/enums";
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

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function saveImages(
  files: File[],
  productSlug: string,
  productName: string,
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
      const extension = IMAGE_EXTENSIONS.get(file.type);

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
        filePath,
        url: `/products/uploads/${fileName}`,
        altText: `${productName} imagen ${index + 1}`,
        sortOrder: index,
        isPrimary: index === 0,
      };
    }),
  );

  return uploads;
}

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = getStringField(formData, "name");
  const brand = getStringField(formData, "brand");
  const categories = getStringArrayField(formData, "categories");
  const description = getStringField(formData, "description");
  const statusValue = getStringField(formData, "status");
  const priceUsdValue =
    getStringField(formData, "priceUsd") || getStringField(formData, "price");
  const priceVesValue = getStringField(formData, "priceVes");
  const stockValue = getStringField(formData, "stock");
  const imageFiles = getImageFiles(formData);

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

  if (categories.length === 0) {
    return NextResponse.json(
      { message: "Debes agregar al menos una categoria." },
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

  const productSlug = await createUniqueSlug(name, async (candidate) => {
    const product = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    return Boolean(product);
  });

  const uploadedFiles: Awaited<ReturnType<typeof saveImages>> = [];

  try {
    const primaryCategory = categories[0];
    const [brandRecord, categoryRecord, sku] = await Promise.all([
      getOrCreateBrand(brand),
      getOrCreateCategory(primaryCategory),
      createUniqueSku(),
    ]);

    uploadedFiles.push(...(await saveImages(imageFiles, productSlug, name)));

    const createdProduct = await prisma.product.create({
      data: {
        sku,
        slug: productSlug,
        name,
        description,
        categoryLabels: categories,
        price: priceUsd.toFixed(2),
        priceVes: priceVes.toFixed(2),
        stockQuantity: stock,
        status,
        brandId: brandRecord.id,
        categoryId: categoryRecord.id,
        shippingInfo: "Envio a coordinar segun la zona.",
        features: [],
        images: {
          create: uploadedFiles.map((file) => ({
            url: file.url,
            altText: file.altText,
            sortOrder: file.sortOrder,
            isPrimary: file.isPrimary,
          })),
        },
      },
      select: {
        id: true,
        slug: true,
      },
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
