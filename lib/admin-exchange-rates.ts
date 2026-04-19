import "server-only";

import { cache } from "react";
import type { AdminManagedExchangeRate } from "@/lib/admin-data";
import { prisma } from "@/lib/prisma";

interface ExchangeRateWriteInput {
  rate: number | string;
  source?: string | null;
  effectiveAt?: string | null;
  fetchedAt?: string | null;
}

export class AdminExchangeRateValidationError extends Error {}
export class AdminExchangeRateNotFoundError extends Error {}

const exchangeRateSelect = {
  id: true,
  baseCurrency: true,
  quoteCurrency: true,
  rate: true,
  source: true,
  effectiveAt: true,
  fetchedAt: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapAdminExchangeRate(
  exchangeRate: {
    id: string;
    baseCurrency: string;
    quoteCurrency: string;
    rate: unknown;
    source: string | null;
    effectiveAt: Date;
    fetchedAt: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
): AdminManagedExchangeRate {
  return {
    id: exchangeRate.id,
    baseCurrency: exchangeRate.baseCurrency,
    quoteCurrency: exchangeRate.quoteCurrency,
    rate: Number(exchangeRate.rate),
    source: exchangeRate.source,
    effectiveAt: exchangeRate.effectiveAt.toISOString(),
    fetchedAt: exchangeRate.fetchedAt.toISOString(),
    isActive: exchangeRate.isActive,
    createdAt: exchangeRate.createdAt.toISOString(),
    updatedAt: exchangeRate.updatedAt.toISOString(),
  };
}

function parseDate(value: string | null | undefined, fallback: Date): Date {
  if (!value) {
    return fallback;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AdminExchangeRateValidationError(
      "Ingresa una fecha valida para la tasa.",
    );
  }

  return parsedDate;
}

function normalizeRate(value: number | string): number {
  const numericRate = Number(value);

  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    throw new AdminExchangeRateValidationError(
      "La tasa debe ser un numero valido mayor a cero.",
    );
  }

  return numericRate;
}

function normalizeSource(value: string | null | undefined): string {
  const source = value?.trim();

  if (!source) {
    return "manual";
  }

  return source;
}

async function findExchangeRateById(
  exchangeRateId: string,
): Promise<AdminManagedExchangeRate | null> {
  const normalizedExchangeRateId = exchangeRateId.trim();

  if (!normalizedExchangeRateId) {
    return null;
  }

  const exchangeRate = await prisma.exchangeRate.findUnique({
    where: {
      id: normalizedExchangeRateId,
    },
    select: exchangeRateSelect,
  });

  return exchangeRate ? mapAdminExchangeRate(exchangeRate) : null;
}

export const getAdminExchangeRateHistory = cache(
  async (): Promise<AdminManagedExchangeRate[]> => {
    const exchangeRates = await prisma.exchangeRate.findMany({
      where: {
        baseCurrency: "USD",
        quoteCurrency: "VES",
      },
      orderBy: [
        {
          isActive: "desc",
        },
        {
          effectiveAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: exchangeRateSelect,
      take: 50,
    });

    return exchangeRates.map(mapAdminExchangeRate);
  },
);

export async function createAdminExchangeRate(
  input: ExchangeRateWriteInput,
): Promise<AdminManagedExchangeRate> {
  const now = new Date();
  const rate = normalizeRate(input.rate);
  const source = normalizeSource(input.source);
  const effectiveAt = parseDate(input.effectiveAt, now);
  const fetchedAt = parseDate(input.fetchedAt, now);

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
        rate: rate.toFixed(6),
        source,
        effectiveAt,
        fetchedAt,
        isActive: true,
      },
      select: exchangeRateSelect,
    });
  });

  return mapAdminExchangeRate(exchangeRate);
}

export async function updateAdminExchangeRate(
  exchangeRateId: string,
  input: ExchangeRateWriteInput,
): Promise<AdminManagedExchangeRate> {
  const normalizedExchangeRateId = exchangeRateId.trim();

  if (!normalizedExchangeRateId) {
    throw new AdminExchangeRateNotFoundError("Tasa no encontrada.");
  }

  const existingExchangeRate = await prisma.exchangeRate.findUnique({
    where: {
      id: normalizedExchangeRateId,
    },
    select: exchangeRateSelect,
  });

  if (!existingExchangeRate) {
    throw new AdminExchangeRateNotFoundError("Tasa no encontrada.");
  }

  const rate = normalizeRate(input.rate);
  const source = normalizeSource(input.source);
  const effectiveAt = parseDate(input.effectiveAt, existingExchangeRate.effectiveAt);
  const fetchedAt = parseDate(input.fetchedAt, existingExchangeRate.fetchedAt);

  const exchangeRate = await prisma.exchangeRate.update({
    where: {
      id: existingExchangeRate.id,
    },
    data: {
      rate: rate.toFixed(6),
      source,
      effectiveAt,
      fetchedAt,
    },
    select: exchangeRateSelect,
  });

  return mapAdminExchangeRate(exchangeRate);
}

export async function activateAdminExchangeRate(
  exchangeRateId: string,
): Promise<AdminManagedExchangeRate> {
  const normalizedExchangeRateId = exchangeRateId.trim();

  if (!normalizedExchangeRateId) {
    throw new AdminExchangeRateNotFoundError("Tasa no encontrada.");
  }

  const exchangeRate = await prisma.$transaction(async (transaction) => {
    const existingExchangeRate = await transaction.exchangeRate.findUnique({
      where: {
        id: normalizedExchangeRateId,
      },
      select: exchangeRateSelect,
    });

    if (!existingExchangeRate) {
      throw new AdminExchangeRateNotFoundError("Tasa no encontrada.");
    }

    await transaction.exchangeRate.updateMany({
      where: {
        baseCurrency: existingExchangeRate.baseCurrency,
        quoteCurrency: existingExchangeRate.quoteCurrency,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return transaction.exchangeRate.update({
      where: {
        id: existingExchangeRate.id,
      },
      data: {
        isActive: true,
      },
      select: exchangeRateSelect,
    });
  });

  return mapAdminExchangeRate(exchangeRate);
}

export async function getAdminExchangeRateByIdOrThrow(
  exchangeRateId: string,
): Promise<AdminManagedExchangeRate> {
  const exchangeRate = await findExchangeRateById(exchangeRateId);

  if (!exchangeRate) {
    throw new AdminExchangeRateNotFoundError("Tasa no encontrada.");
  }

  return exchangeRate;
}