import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminExchangeRateNotFoundError,
  AdminExchangeRateValidationError,
  updateAdminExchangeRate,
} from "@/lib/admin-exchange-rates";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

interface ExchangeRatePayload {
  rate?: number | string;
  source?: string;
  effectiveAt?: string;
  fetchedAt?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ exchangeRateId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/exchange-rates");

  if (!access.ok) {
    return access.response;
  }

  const exchangeRateId = (await params).exchangeRateId;
  const body = (await request
    .json()
    .catch(() => null)) as ExchangeRatePayload | null;

  try {
    const exchangeRate = await updateAdminExchangeRate(exchangeRateId, {
      rate: body?.rate ?? "",
      source: body?.source,
      effectiveAt: body?.effectiveAt,
      fetchedAt: body?.fetchedAt,
    });

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
            : "No se pudo actualizar la tasa de cambio.",
      },
      {
        status:
          error instanceof AdminExchangeRateNotFoundError
            ? 404
            : error instanceof AdminExchangeRateValidationError
              ? 400
              : 500,
      },
    );
  }
}