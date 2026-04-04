import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getOrCreateBrand } from "@/lib/admin-catalog";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
  } | null;

  const name = body?.name?.trim() ?? "";

  if (!name) {
    return NextResponse.json(
      { message: "El nombre de la marca es obligatorio." },
      { status: 400 },
    );
  }

  const brand = await getOrCreateBrand(name);

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return NextResponse.json({ brand }, { status: 201 });
}
