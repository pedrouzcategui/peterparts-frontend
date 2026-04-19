"use server";

import { revalidatePath } from "next/cache";
import { requireAdminActionAccess } from "@/lib/auth/admin";
import {
  archiveAdminProduct,
  archiveAdminProducts,
  createAdminProduct,
  hardDeleteAdminProduct,
  hardDeleteAdminProducts,
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
  count?: number;
  total?: number;
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
      message: "Producto archivado correctamente.",
    };
  } catch (error) {
    return {
      ok: false,
      message: extractErrorMessage(error),
    };
  }
}

export async function archiveAdminProductsAction(
  productIds: string[],
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();

    const normalizedProductIds = productIds
      .filter((productId) => typeof productId === "string")
      .map((productId) => productId.trim())
      .filter(Boolean);

    if (normalizedProductIds.length === 0) {
      return {
        ok: false,
        message: "Debes seleccionar al menos un producto.",
      };
    }

    const { matchedCount, archivedCount } = await archiveAdminProducts(
      normalizedProductIds,
    );
    revalidateProductPaths();

    if (archivedCount === 0) {
      return {
        ok: true,
        message:
          matchedCount === 1
            ? "El producto seleccionado ya estaba archivado."
            : `Los ${matchedCount} productos seleccionados ya estaban archivados.`,
        count: archivedCount,
        total: matchedCount,
      };
    }

    if (archivedCount === matchedCount) {
      return {
        ok: true,
        message:
          archivedCount === 1
            ? "1 producto archivado correctamente."
            : `${archivedCount} productos archivados correctamente.`,
        count: archivedCount,
        total: matchedCount,
      };
    }

    return {
      ok: true,
      message: `Se archivaron ${archivedCount} de ${matchedCount} productos seleccionados.`,
      count: archivedCount,
      total: matchedCount,
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

export async function hardDeleteAdminProductsAction(
  productIds: string[],
): Promise<AdminProductActionResult> {
  try {
    await requireAdminActionAccess();

    const normalizedProductIds = productIds
      .filter((productId) => typeof productId === "string")
      .map((productId) => productId.trim())
      .filter(Boolean);

    if (normalizedProductIds.length === 0) {
      return {
        ok: false,
        message: "Debes seleccionar al menos un producto.",
      };
    }

    const { matchedCount, deletedCount } = await hardDeleteAdminProducts(
      normalizedProductIds,
    );
    revalidateProductPaths();

    if (deletedCount === 0) {
      return {
        ok: false,
        message: "No se pudo eliminar ninguno de los productos seleccionados.",
        count: deletedCount,
        total: matchedCount,
      };
    }

    if (deletedCount === matchedCount) {
      return {
        ok: true,
        message:
          deletedCount === 1
            ? "1 producto eliminado definitivamente."
            : `${deletedCount} productos eliminados definitivamente.`,
        count: deletedCount,
        total: matchedCount,
      };
    }

    return {
      ok: true,
      message: `Se eliminaron ${deletedCount} de ${matchedCount} productos seleccionados.`,
      count: deletedCount,
      total: matchedCount,
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
