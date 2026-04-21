import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  AdminExchangeRateValidationError,
  createAdminExchangeRate,
  getAdminExchangeRateHistory,
} from "@/lib/admin-exchange-rates";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

interface ExchangeRatePayload {
  rate?: number | string;
  source?: string;
  effectiveAt?: string;
  fetchedAt?: string;
}

export async function GET() {
  const access = await requireAdminApiAccess("/admin/exchange-rates");

  if (!access.ok) {
    return access.response;
  }

  const exchangeRates = await getAdminExchangeRateHistory();
  const activeExchangeRate = exchangeRates.find(
    (exchangeRate) => exchangeRate.isActive,
  );

  return NextResponse.json(
    {
      exchangeRate: activeExchangeRate ?? null,
      exchangeRates,
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const access = await requireAdminApiAccess("/admin/exchange-rates");

  if (!access.ok) {
    return access.response;
  }

  const body = (await request
    .json()
    .catch(() => null)) as ExchangeRatePayload | null;
  try {
    const exchangeRate = await createAdminExchangeRate({
      rate: body?.rate ?? "",
      source: body?.source,
      effectiveAt: body?.effectiveAt,
      fetchedAt: body?.fetchedAt,
    });

    revalidatePath("/admin/exchange-rates");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return NextResponse.json({ exchangeRate }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo registrar la tasa de cambio.",
      },
      {
        status:
          error instanceof AdminExchangeRateValidationError ? 400 : 500,
      },
    );
  }
}
