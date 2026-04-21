import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  activateAdminExchangeRate,
  AdminExchangeRateNotFoundError,
} from "@/lib/admin-exchange-rates";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ exchangeRateId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/exchange-rates");

  if (!access.ok) {
    return access.response;
  }

  const exchangeRateId = (await params).exchangeRateId;

  try {
    const exchangeRate = await activateAdminExchangeRate(exchangeRateId);

    revalidatePath("/admin/exchange-rates");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json({ exchangeRate }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo activar la tasa de cambio.",
      },
      {
        status: error instanceof AdminExchangeRateNotFoundError ? 404 : 500,
      },
    );
  }
}