const usdFormatter = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "USD",
});

const vesFormatter = new Intl.NumberFormat("es-VE", {
  style: "currency",
  currency: "VES",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const exchangeRateFormatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatUsd(value: number): string {
  return usdFormatter.format(value);
}

export function formatVes(value: number): string {
  return vesFormatter.format(value);
}

export function formatExchangeRate(value: number): string {
  return exchangeRateFormatter.format(value);
}

export function resolveVesAmount(
  explicitAmount: number | null | undefined,
  usdAmount: number,
  exchangeRate: number | null,
): number {
  if (typeof explicitAmount === "number" && explicitAmount > 0) {
    return roundMoney(explicitAmount);
  }

  if (typeof exchangeRate === "number" && exchangeRate > 0) {
    return roundMoney(usdAmount * exchangeRate);
  }

  return 0;
}
