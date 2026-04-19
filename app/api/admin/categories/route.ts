import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminCategoryConflictError,
  AdminCategoryValidationError,
  createAdminManagedCategory,
  getAdminManagedCategories,
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

  return 500;
}

export async function GET() {
  const access = await requireAdminApiAccess("/admin/categories");

  if (!access.ok) {
    return access.response;
  }

  const categories = await getAdminManagedCategories();
  return NextResponse.json({ categories }, { status: 200 });
}

export async function POST(request: Request) {
  const access = await requireAdminApiAccess("/admin/categories");

  if (!access.ok) {
    return access.response;
  }

  const body = parseCategoryPayload(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json(
      { message: "Los datos enviados no tienen el formato esperado." },
      { status: 400 },
    );
  }

  try {
    const category = await createAdminManagedCategory(toInput(body));

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo crear la categoria.",
      },
      { status: resolveStatus(error) },
    );
  }
}