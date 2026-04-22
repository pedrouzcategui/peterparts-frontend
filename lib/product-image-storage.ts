export const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const PRODUCT_IMAGE_EXTENSION_BY_TYPE = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

const PRODUCT_IMAGE_BLOB_PREFIX = "products";

interface ProductImageFileLike {
  name: string;
  size: number;
  type: string;
}

function sanitizeBlobPathSegment(value: string) {
  return value
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getProductImageExtension(contentType: string) {
  return PRODUCT_IMAGE_EXTENSION_BY_TYPE.get(contentType) ?? null;
}

export function validateProductImageFile(file: ProductImageFileLike) {
  if (!getProductImageExtension(file.type)) {
    return `El archivo ${file.name} no es una imagen compatible.`;
  }

  if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
    return `La imagen ${file.name} supera el limite de 5 MB.`;
  }

  return null;
}

export function buildProductImageUploadPath(
  imageId: string,
  fileName: string,
  extension: string,
) {
  const normalizedId = sanitizeBlobPathSegment(imageId) || "image";
  const fileBaseName = fileName.replace(/\.[^.]+$/, "");
  const normalizedFileName = sanitizeBlobPathSegment(fileBaseName) || "upload";

  return `${PRODUCT_IMAGE_BLOB_PREFIX}/${normalizedId}-${normalizedFileName}.${extension}`;
}

export function isValidProductImageUploadPath(pathname: string) {
  return (
    pathname.startsWith(`${PRODUCT_IMAGE_BLOB_PREFIX}/`) &&
    !pathname.includes("..") &&
    /^products\/[a-z0-9][a-z0-9./_-]*$/i.test(pathname)
  );
}

export function isLegacyProductImageUploadUrl(url: string) {
  return url.startsWith("/products/uploads/");
}

export function isBlobProductImageUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    return (
      parsedUrl.protocol === "https:" &&
      parsedUrl.hostname.endsWith(".blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

export function isManagedProductImageUrl(url: string) {
  return isBlobProductImageUrl(url) || isLegacyProductImageUploadUrl(url);
}