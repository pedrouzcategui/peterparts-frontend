"use server";

import { revalidatePath } from "next/cache";
import { requireAdminActionAccess } from "@/lib/auth/admin";
import {
  archiveAdminProduct,
  createAdminProduct,
  hardDeleteAdminProduct,
  importPlaceholderProducts,
  restoreAdminProduct,
  updateAdminProduct,
  type AdminProductInputStatus,
  type AdminProductWriteInput,
} from "@/lib/admin-products";

export interface AdminProductFormInput {
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: AdminProductInputStatus;
  imageUrls: string[];
}

export interface AdminProductActionResult {
  ok: boolean;
  message: string;
}

function mapInput(input: AdminProductFormInput): AdminProductWriteInput {
  return {
    name: input.name,
    brand: input.brand,
    category: input.category,
    price: Number(input.price),
    stock: Number(input.stock),
    status: input.status,
    imageUrls: input.imageUrls,
  };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrio un error inesperado.";
}

function revalidateProductPaths() {
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function createAdminProductAction(
  input: AdminProductFormInput,
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    await createAdminProduct(mapInput(input));
    revalidateProductPaths();

    return {
      ok: true,
      message: "Producto creado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function updateAdminProductAction(
  productId: string,
  input: AdminProductFormInput,
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    await updateAdminProduct(productId, mapInput(input));
    revalidateProductPaths();

    return {
      ok: true,
      message: "Producto actualizado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function archiveAdminProductAction(
  productId: string,
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    await archiveAdminProduct(productId);
    revalidateProductPaths();

    return {
      ok: true,
      message: "Producto enviado a la papelera.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function restoreAdminProductAction(
  productId: string,
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    await restoreAdminProduct(productId);
    revalidateProductPaths();

    return {
      ok: true,
      message: "Producto restaurado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function hardDeleteAdminProductAction(
  productId: string,
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    await hardDeleteAdminProduct(productId);
    revalidateProductPaths();

    return {
      ok: true,
      message: "Producto eliminado definitivamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function importPlaceholderProductsAction(): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();
    const { created, skipped } = await importPlaceholderProducts();
    revalidateProductPaths();

    return {
      ok: true,
      message: `Importacion completada: ${created} creados, ${skipped} omitidos.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}
