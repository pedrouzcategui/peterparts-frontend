import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminCategoryConflictError,
  AdminCategoryDeleteBlockedError,
  AdminCategoryNotFoundError,
  AdminCategoryValidationError,
  deleteAdminManagedCategory,
  updateAdminManagedCategory,
} from "@/lib/admin-categories";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

interface CategoryPayload {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  parentId?: unknown;
}

function parseCategoryPayload(value: unknown): CategoryPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as CategoryPayload;
}

function toInput(payload: CategoryPayload) {
  return {
    name: typeof payload.name === "string" ? payload.name : "",
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    description:
      typeof payload.description === "string" ? payload.description : undefined,
    parentId:
      typeof payload.parentId === "string"
        ? payload.parentId
        : payload.parentId === null
          ? null
          : undefined,
  };
}

function resolveStatus(error: unknown): number {
  if (error instanceof AdminCategoryValidationError) {
    return 400;
  }

  if (error instanceof AdminCategoryConflictError) {
    return 409;
  }

  if (error instanceof AdminCategoryDeleteBlockedError) {
    return 409;
  }

  if (error instanceof AdminCategoryNotFoundError) {
    return 404;
  }

  return 500;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/categories");

  if (!access.ok) {
    return access.response;
  }

  const categoryId = (await params).categoryId;
  const body = parseCategoryPayload(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json(
      { message: "Los datos enviados no tienen el formato esperado." },
      { status: 400 },
    );
  }

  try {
    const category = await updateAdminManagedCategory(categoryId, toInput(body));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json({ category }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la categoria.",
      },
      { status: resolveStatus(error) },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/categories");

  if (!access.ok) {
    return access.response;
  }

  const categoryId = (await params).categoryId;

  try {
    await deleteAdminManagedCategory(categoryId);

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json(
      { message: "Categoria eliminada correctamente." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la categoria.",
      },
      { status: resolveStatus(error) },
    );
  }
}