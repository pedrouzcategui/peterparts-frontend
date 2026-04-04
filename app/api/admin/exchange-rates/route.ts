import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface ExchangeRatePayload {
  rate?: number | string;
  source?: string;
  effectiveAt?: string;
  fetchedAt?: string;
}

function parseDate(value: string | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime()) ? fallback : parsedDate;
}

export async function GET() {
  const exchangeRate = await prisma.exchangeRate.findFirst({
    where: {
      baseCurrency: "USD",
      quoteCurrency: "VES",
      isActive: true,
    },
    orderBy: [{ effectiveAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      rate: true,
      source: true,
      effectiveAt: true,
      fetchedAt: true,
      updatedAt: true,
    },
  });

  if (!exchangeRate) {
    return NextResponse.json({ exchangeRate: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      exchangeRate: {
        ...exchangeRate,
        rate: Number(exchangeRate.rate),
      },
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ExchangeRatePayload | null;
  const numericRate = Number(body?.rate);

  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    return NextResponse.json(
      { message: "La tasa debe ser un numero valido mayor a cero." },
      { status: 400 },
    );
  }

  const now = new Date();
  const effectiveAt = parseDate(body?.effectiveAt, now);
  const fetchedAt = parseDate(body?.fetchedAt, now);
  const source = body?.source?.trim() || "manual";

  const exchangeRate = await prisma.$transaction(async (transaction) => {
    await transaction.exchangeRate.updateMany({
      where: {
        baseCurrency: "USD",
        quoteCurrency: "VES",
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return transaction.exchangeRate.create({
      data: {
        baseCurrency: "USD",
        quoteCurrency: "VES",
        rate: numericRate.toFixed(6),
        source,
        effectiveAt,
        fetchedAt,
        isActive: true,
      },
      select: {
        id: true,
        rate: true,
        source: true,
        effectiveAt: true,
        fetchedAt: true,
        updatedAt: true,
      },
    });
  });

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return NextResponse.json(
    {
      exchangeRate: {
        ...exchangeRate,
        rate: Number(exchangeRate.rate),
      },
    },
    { status: 201 },
  );
}