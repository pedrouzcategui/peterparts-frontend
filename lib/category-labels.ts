function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCategoryLabels(
  primaryCategoryName: string,
  values: string[],
): string[] {
  const normalizedPrimary = normalizeLabel(primaryCategoryName);
  const primaryKey = normalizedPrimary.toLocaleLowerCase("es");
  const seen = new Set(primaryKey ? [primaryKey] : []);

  return values
    .map(normalizeLabel)
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLocaleLowerCase("es");

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
}