import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdminActionAccess, requireAdminApiAccess } from "@/lib/auth/admin";
import { deleteProductImageAssets } from "@/lib/product-image-storage.server";
import {
  MAX_PRODUCT_IMAGE_SIZE_BYTES,
  PRODUCT_IMAGE_CONTENT_TYPES,
  isManagedProductImageUrl,
  isValidProductImageUploadPath,
} from "@/lib/product-image-storage";

export const runtime = "nodejs";

function getDeleteUrls(value: unknown) {
  if (!value || typeof value !== "object") {
    return [];
  }

  const urls = (value as { urls?: unknown }).urls;

  if (!Array.isArray(urls)) {
    return [];
  }

  return urls
    .filter((url): url is string => typeof url === "string")
    .map((url) => url.trim())
    .filter(Boolean)
    .filter(isManagedProductImageUrl);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: HandleUploadBody;

  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json(
      { message: "No se pudo preparar la solicitud de carga." },
      { status: 400 },
    );
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        await requireAdminActionAccess();

        if (!isValidProductImageUploadPath(pathname)) {
          throw new Error("La ruta de carga de la imagen no es valida.");
        }

        return {
          access: "public",
          addRandomSuffix: true,
          allowedContentTypes: [...PRODUCT_IMAGE_CONTENT_TYPES],
          maximumSizeInBytes: MAX_PRODUCT_IMAGE_SIZE_BYTES,
        };
      },
      onUploadCompleted: async () => undefined,
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo iniciar la carga de la imagen.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const access = await requireAdminApiAccess("/admin/products");

  if (!access.ok) {
    return access.response;
  }

  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json(
      { message: "La solicitud para eliminar imagenes no es valida." },
      { status: 400 },
    );
  }

  const urls = getDeleteUrls(requestBody);

  if (urls.length === 0) {
    return NextResponse.json(
      { message: "No se recibieron imagenes validas para eliminar." },
      { status: 400 },
    );
  }

  try {
    await deleteProductImageAssets(urls);

    return NextResponse.json({ message: "Imagenes eliminadas correctamente." });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudieron eliminar las imagenes.",
      },
      { status: 500 },
    );
  }
}