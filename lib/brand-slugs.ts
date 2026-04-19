const CANONICAL_BRAND_QUERY_VALUES = {
  kitchenaid: "kitchenaid",
} as const;

export function getBrandQueryValue(brand: string): string {
  const trimmedBrand = brand.trim();

  if (!trimmedBrand) {
    return trimmedBrand;
  }

  const lowercaseBrand = trimmedBrand.toLowerCase();

  return (
    CANONICAL_BRAND_QUERY_VALUES[
      lowercaseBrand as keyof typeof CANONICAL_BRAND_QUERY_VALUES
    ] ?? trimmedBrand
  );
}
