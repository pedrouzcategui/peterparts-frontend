import "server-only";

import path from "node:path";
import { unlink } from "node:fs/promises";
import { del } from "@vercel/blob";
import {
  isBlobProductImageUrl,
  isLegacyProductImageUploadUrl,
} from "@/lib/product-image-storage";

function resolveLegacyProductImagePath(url: string) {
  return path.join(process.cwd(), "public", ...url.replace(/^\//, "").split("/"));
}

export async function deleteProductImageAssets(urls: string[]) {
  const uniqueUrls = Array.from(
    new Set(urls.map((url) => url.trim()).filter(Boolean)),
  );
  const blobUrls = uniqueUrls.filter(isBlobProductImageUrl);
  const legacyUrls = uniqueUrls.filter(isLegacyProductImageUploadUrl);

  if (blobUrls.length > 0) {
    await del(blobUrls);
  }

  await Promise.all(
    legacyUrls.map(async (url) => {
      await unlink(resolveLegacyProductImagePath(url)).catch(() => undefined);
    }),
  );
}