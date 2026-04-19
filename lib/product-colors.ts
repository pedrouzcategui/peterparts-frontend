const DEFAULT_PRODUCT_COLOR_VALUE = "#cfd6dc";

export interface ProductColorDefinition {
  label: string;
  colorValue: string;
}

export const PREDEFINED_PRODUCT_COLORS: ProductColorDefinition[] = [
  { label: "Acero inoxidable", colorValue: "#cfd3d7" },
  { label: "Negro", colorValue: "#1a1714" },
  { label: "Blanco", colorValue: "#f8f7f3" },
  { label: "Rojo", colorValue: "#c61c31" },
  { label: "Plata", colorValue: "#bcc4ce" },
  { label: "Gris", colorValue: "#7e8791" },
  { label: "Azul", colorValue: "#7da6d9" },
  { label: "Verde", colorValue: "#8ca37b" },
  { label: "Crema", colorValue: "#eadfc8" },
  { label: "Dorado", colorValue: "#d5b25c" },
];

const PRODUCT_COLOR_MATCHERS: Array<{
  match: RegExp;
  colorValue: string;
}> = [
  { match: /stainless|inoxidable|silver\/black|chrome/i, colorValue: "#cfd3d7" },
  { match: /black|onyx|ink|matte|negro/i, colorValue: "#1a1714" },
  { match: /white|milk|porcelain|blanco/i, colorValue: "#f8f7f3" },
  { match: /red|empire|candy apple|burgundy|rojo/i, colorValue: "#c61c31" },
  { match: /silver|plata|contour/i, colorValue: "#bcc4ce" },
  { match: /blue|ice|sky|aqua|azul/i, colorValue: "#7da6d9" },
  { match: /green|sage|pistachio|verde/i, colorValue: "#8ca37b" },
  { match: /pink|lavender|lilac|rose/i, colorValue: "#d8bfd3" },
  { match: /yellow|gold|dorado/i, colorValue: "#d5b25c" },
  { match: /orange|copper/i, colorValue: "#c97a35" },
  { match: /cream|beige|almond|crema/i, colorValue: "#eadfc8" },
  { match: /gray|grey|gris/i, colorValue: "#7e8791" },
];

function expandShortHex(value: string) {
  return value
    .slice(1)
    .split("")
    .map((character) => `${character}${character}`)
    .join("");
}

export function normalizeProductColorLabel(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeProductColorValue(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (/^#[0-9a-fA-F]{3}$/.test(normalizedValue)) {
    return `#${expandShortHex(normalizedValue).toLowerCase()}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(normalizedValue)) {
    return normalizedValue.toLowerCase();
  }

  return null;
}

export function inferProductColorValue(label: string) {
  const normalizedLabel = normalizeProductColorLabel(label);

  if (!normalizedLabel) {
    return DEFAULT_PRODUCT_COLOR_VALUE;
  }

  const presetMatch = PREDEFINED_PRODUCT_COLORS.find(
    (color) => color.label.toLocaleLowerCase("es") === normalizedLabel.toLocaleLowerCase("es"),
  );

  if (presetMatch) {
    return presetMatch.colorValue;
  }

  const matcher = PRODUCT_COLOR_MATCHERS.find((entry) => entry.match.test(normalizedLabel));

  return matcher?.colorValue ?? DEFAULT_PRODUCT_COLOR_VALUE;
}

export function resolveProductColorValue(
  label: string,
  colorValue?: string | null,
) {
  return normalizeProductColorValue(colorValue ?? "") ?? inferProductColorValue(label);
}

export function buildProductColorFilterValue(label: string) {
  const normalizedLabel = normalizeProductColorLabel(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedLabel || "color";
}
