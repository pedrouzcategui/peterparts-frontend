import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminColorConflictError,
  AdminColorDeleteBlockedError,
  AdminColorNotFoundError,
  AdminColorValidationError,
  deleteAdminManagedColor,
  updateAdminManagedColor,
} from "@/lib/admin-colors";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

interface ColorPayload {
  label?: unknown;
  colorValue?: unknown;
  isBasePalette?: unknown;
}

function parseColorPayload(value: unknown): ColorPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ColorPayload;
}

function toInput(payload: ColorPayload) {
  return {
    label: typeof payload.label === "string" ? payload.label : "",
    colorValue: typeof payload.colorValue === "string" ? payload.colorValue : "",
    isBasePalette: payload.isBasePalette === true,
  };
}

function resolveStatus(error: unknown): number {
  if (error instanceof AdminColorValidationError) {
    return 400;
  }

  if (error instanceof AdminColorConflictError) {
    return 409;
  }

  if (error instanceof AdminColorDeleteBlockedError) {
    return 409;
  }

  if (error instanceof AdminColorNotFoundError) {
    return 404;
  }

  return 500;
}

function revalidateColorPaths() {
  revalidatePath("/");
  revalidatePath("/admin/colors");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ colorId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/colors");

  if (!access.ok) {
    return access.response;
  }

  const colorId = (await params).colorId;
  const body = parseColorPayload(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json(
      { message: "Los datos enviados no tienen el formato esperado." },
      { status: 400 },
    );
  }

  try {
    const color = await updateAdminManagedColor(colorId, toInput(body));

    revalidateColorPaths();

    return NextResponse.json({ color }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar el color.",
      },
      { status: resolveStatus(error) },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ colorId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/colors");

  if (!access.ok) {
    return access.response;
  }

  const colorId = (await params).colorId;

  try {
    await deleteAdminManagedColor(colorId);

    revalidateColorPaths();

    return NextResponse.json(
      { message: "Color eliminado correctamente." },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "No se pudo eliminar el color.",
      },
      { status: resolveStatus(error) },
    );
  }
}