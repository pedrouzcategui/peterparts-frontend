import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminColorConflictError,
  AdminColorValidationError,
  createAdminManagedColor,
  getAdminManagedColors,
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

  return 500;
}

function revalidateColorPaths() {
  revalidatePath("/");
  revalidatePath("/admin/colors");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function GET() {
  const access = await requireAdminApiAccess("/admin/colors");

  if (!access.ok) {
    return access.response;
  }

  const colors = await getAdminManagedColors();
  return NextResponse.json({ colors }, { status: 200 });
}

export async function POST(request: Request) {
  const access = await requireAdminApiAccess("/admin/colors");

  if (!access.ok) {
    return access.response;
  }

  const body = parseColorPayload(await request.json().catch(() => null));

  if (!body) {
    return NextResponse.json(
      { message: "Los datos enviados no tienen el formato esperado." },
      { status: 400 },
    );
  }

  try {
    const color = await createAdminManagedColor(toInput(body));

    revalidateColorPaths();

    return NextResponse.json({ color }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "No se pudo crear el color.",
      },
      { status: resolveStatus(error) },
    );
  }
}