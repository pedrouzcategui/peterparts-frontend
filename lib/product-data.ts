import "server-only";

import { cache } from "react";
import { products as staticCatalogProducts } from "@/lib/data";
import type { Prisma } from "@/lib/generated/prisma/client";
import { resolveVesAmount } from "@/lib/currency";
import { ProductBadge, ProductStatus } from "@/lib/generated/prisma/enums";
import type {
  AdminColorSuggestion,
  AdminExchangeRate,
  AdminProduct,
  AdminProductEditorColor,
  AdminProductEditorData,
  AdminProductPromotionBadge,
  AdminProductEditorReview,
} from "@/lib/admin-data";
import { normalizeCategoryLabels } from "@/lib/category-labels";
import {
  buildProductColorFilterValue,
  PREDEFINED_PRODUCT_COLORS,
  resolveProductColorValue,
} from "@/lib/product-colors";
import { getBrandQueryValue } from "@/lib/brand-slugs";
import { runStorefrontReadWithFallback } from "@/lib/storefront-query-resilience";
import type { FilterGroup, Product } from "@/lib/types";
import { prisma } from "@/lib/prisma";

const PRICE_FILTERS = [
  {
    label: "Menos de $100",
    value: "0-100",
    matches: (price: number) => price < 100,
  },
  {
    label: "$100 - $300",
    value: "100-300",
    matches: (price: number) => price >= 100 && price < 300,
  },
  {
    label: "$300 - $500",
    value: "300-500",
    matches: (price: number) => price >= 300 && price < 500,
  },
  {
    label: "$500 - $1000",
    value: "500-1000",
    matches: (price: number) => price >= 500 && price < 1000,
  },
  {
    label: "Mas de $1000",
    value: "1000-up",
    matches: (price: number) => price >= 1000,
  },
] as const;

const TERM_TRANSLATIONS: Record<string, string> = {
  "Brushed Stainless": "Acero inoxidable cepillado",
  White: "Blanco",
  Black: "Negro",
  Red: "Rojo",
  "Stainless Steel": "Acero inoxidable",
  "Silver/Black": "Plata/Negro",
  Chrome: "Cromo",
  "Fingerprint Resistant Stainless Steel": "Acero inoxidable antihuellas",
  "Black Stainless": "Acero inoxidable negro",
  "Empire Red": "Rojo imperial",
  "Onyx Black": "Negro onix",
  "Ice Blue": "Azul hielo",
  "Contour Silver": "Plata contour",
  Pistachio: "Pistacho",
  "Candy Apple Red": "Rojo manzana",
  "Sugar Pearl Silver": "Plata perla",
  "Black Matte": "Negro mate",
};

const SHIPPING_TRANSLATIONS: Record<string, string> = {
  "Free shipping on orders over $50":
    "Envio gratis en pedidos superiores a $50",
  "Free delivery & installation": "Entrega e instalacion gratis",
};

const PRODUCT_TRANSLATIONS: Record<
  string,
  {
    description: string;
    features: string[];
  }
> = {
  "cuisinart-14-cup-food-processor": {
    description:
      "El Cuisinart de 14 tazas es un aliado potente para la cocina diaria. Su motor de 720 watts y sus controles intuitivos facilitan desde picar vegetales hasta amasar, mientras el tazon Tritan libre de BPA se limpia facilmente en el lavavajillas.",
    features: [
      "Motor de 720 watts para un rendimiento potente",
      "Tazon Tritan libre de BPA con capacidad de 14 tazas",
      "Cuchillas de acero inoxidable",
      "Controles intuitivos de encendido, apagado y pulso",
      "Piezas aptas para lavavajillas",
      "Incluye disco para rebanar y disco para rallar",
    ],
  },
  "cuisinart-perfectemp-coffee-maker": {
    description:
      "Prepara cafe mas caliente y con mejor sabor con la Cuisinart PerfecTemp de 14 tazas. Su tecnologia de infusion avanzada, junto con los modos intenso y regular, ofrece una taza consistente para toda la familia.",
    features: [
      "Jarra de vidrio con capacidad de 14 tazas",
      "Control de intensidad: regular o intenso",
      "Programacion automatica de 24 horas",
      "Funcion de autolimpieza",
      "Control ajustable para mantener caliente",
      "Incluye filtros de carbon y tono dorado",
    ],
  },
  "cuisinart-griddler-five": {
    description:
      "La Cuisinart Griddler FIVE ofrece cinco modos de coccion en un solo equipo compacto. Funciona como parrilla de contacto, prensa para paninis, parrilla completa, plancha completa o combinacion de ambas para una cocina mas versatil.",
    features: [
      "Funcionalidad 5 en 1",
      "Placas antiadherentes removibles y reversibles",
      "Controles de temperatura ajustables",
      "Tapa flotante que se adapta al grosor de los alimentos",
      "Bandeja recolectora integrada",
      "Placas removibles aptas para lavavajillas",
    ],
  },
  "cuisinart-smartpower-blender": {
    description:
      "La Cuisinart SmartPower Duet combina licuadora y procesador de alimentos en un solo aparato. Su motor de 500 watts, la jarra de vidrio y el accesorio procesador la convierten en una opcion practica para preparar bebidas, salsas y mezclas.",
    features: [
      "Motor de 500 watts",
      "Panel tactil de 7 velocidades con indicadores LED",
      "Jarra de vidrio de 48 onzas",
      "Accesorio procesador de alimentos de 3 tazas",
      "Cuchillas de acero inoxidable",
      "Componentes libres de BPA",
    ],
  },
  "whirlpool-french-door-refrigerator": {
    description:
      "Este refrigerador Whirlpool French Door ofrece 25 pies cubicos de capacidad con una distribucion inspirada en despensa para organizar mejor los alimentos. El sistema de descongelacion adaptativa optimiza el rendimiento y la iluminacion LED facilita encontrar todo rapidamente.",
    features: [
      "Capacidad de 25 pies cubicos",
      "Almacenamiento de ancho completo estilo despensa",
      "Descongelacion adaptativa para mayor eficiencia",
      "Iluminacion interior LED",
      "Cajones con control de humedad",
      "Dispensador externo de agua y hielo con filtracion EveryDrop",
    ],
  },
  "whirlpool-electric-range": {
    description:
      "Cocina para toda la familia con esta cocina electrica Whirlpool de 5.3 pies cubicos. La tecnologia Frozen Bake permite omitir el precalentado para preparar alimentos congelados mas rapido, mientras los elementos FlexHeat funcionan como uno o dos quemadores segun lo necesites.",
    features: [
      "Capacidad de horno de 5.3 pies cubicos",
      "Tecnologia Frozen Bake para omitir el precalentado",
      "Elemento radiante doble FlexHeat",
      "Funcion Keep Warm",
      "Horno autolimpiante",
      "Parrilla de horno ajustable para autolimpieza",
    ],
  },
  "whirlpool-dishwasher-quiet": {
    description:
      "Consigue una limpieza eficiente con este lavavajillas Whirlpool. Integra un tercer nivel para mayor capacidad, un sensor de suciedad que ajusta el ciclo adecuado y una operacion silenciosa de 47 dBA para usarlo a cualquier hora.",
    features: [
      "Funcionamiento silencioso de 47 dBA",
      "Tercer nivel de carga",
      "Ciclo con sensor de suciedad",
      "Lavado rapido de 1 hora",
      "Bandeja superior ajustable",
      "Opcion Heated Dry",
    ],
  },
  "whirlpool-microwave-hood": {
    description:
      "Este microondas Whirlpool para sobre la cocina ofrece 1.9 pies cubicos de capacidad y coccion con sensor que ajusta tiempo y potencia automaticamente. La funcion de vapor ayuda a preparar comidas practicas y saludables en menos tiempo.",
    features: [
      "Capacidad de 1.9 pies cubicos",
      "Coccion con sensor y 6 opciones",
      "Funcion de coccion al vapor",
      "Sistema de ventilacion de 300 CFM",
      "Interior antiadherente CleanRelease",
      "Opcion para activar o desactivar el plato giratorio",
    ],
  },
  "kitchenaid-artisan-stand-mixer": {
    description:
      "La KitchenAid Artisan de 5 cuartos es una pieza iconica para cualquier cocina. Sus 10 velocidades optimizadas y su potente motor trabajan desde masas densas hasta merengues ligeros, y su cabezal inclinable facilita el cambio de accesorios.",
    features: [
      "Motor de 325 watts",
      "Tazon de acero inoxidable de 5 cuartos",
      "10 velocidades optimizadas",
      "Cabezal inclinable para acceso sencillo",
      "Incluye batidor plano, gancho amasador y batidor de globo",
      "Puerto de potencia para mas de 10 accesorios opcionales",
    ],
  },
  "kitchenaid-pro-line-blender": {
    description:
      "Descubre la potencia de la KitchenAid Pro Line Series Blender con su cuchilla asimetrica exclusiva y jarra Thermal Control. Entrega resultados de nivel profesional en smoothies, cremas y sopas gracias a su motor de 3.5 HP pico.",
    features: [
      "Motor de 3.5 HP pico",
      "Diseno exclusivo de cuchilla asimetrica",
      "Base metalica de doble pared",
      "Jarra Thermal Control resistente al choque termico",
      "Perilla de velocidad variable con programas preestablecidos",
      "Ciclo de autolimpieza",
    ],
  },
  "kitchenaid-convection-toaster-oven": {
    description:
      "El horno digital KitchenAid para encimera con Air Fry ofrece 9 funciones de coccion, incluyendo freir con aire, hornear, asar, tostar, recalentar y deshidratar. Su interior amplio permite hornear una pizza de 12 pulgadas o hasta 6 rebanadas de pan.",
    features: [
      "9 funciones de coccion preestablecidas",
      "Funcion Air Fry",
      "Capacidad para pizza de 12 pulgadas",
      "Tecnologia de calor uniforme",
      "Interior antiadherente",
      "Temporizador de 120 minutos con apagado automatico",
    ],
  },
  "kitchenaid-hand-mixer": {
    description:
      "La batidora de mano KitchenAid de 7 velocidades esta pensada para mezclas de todo tipo, desde masas espesas hasta crema batida ligera. Su mango de agarre suave mejora el control y el cable giratorio con bloqueo ayuda a trabajar con comodidad.",
    features: [
      "7 velocidades de mezclado",
      "Inicio suave para evitar salpicaduras",
      "Batidores turbo de acero inoxidable",
      "Cable giratorio con bloqueo",
      "Mango ergonomico de agarre suave",
      "Incluye globo profesional y ganchos para masa",
    ],
  },
};

export const productInclude = {
  brand: true,
  category: {
    include: {
      parent: true,
    },
  },
  images: {
    include: {
      variantAssignments: {
        include: {
          productVariant: {
            select: {
              id: true,
              label: true,
            },
          },
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  },
  variants: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.ProductInclude;

export type DatabaseProduct = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

type StaticCatalogProduct = (typeof staticCatalogProducts)[number];

const exchangeRateSelect = {
  rate: true,
  source: true,
  effectiveAt: true,
  fetchedAt: true,
} as const;

function toBrand(value: string): Product["brand"] {
  return value.trim();
}

function translateTerm(value: string): string {
  return TERM_TRANSLATIONS[value] ?? value;
}

function translateShippingInfo(value: string | null): string {
  if (!value) {
    return "";
  }

  return SHIPPING_TRANSLATIONS[value] ?? value;
}

function translateImageAlt(value: string): string {
  return value
    .replace(" front view", " vista frontal")
    .replace(" side view", " vista lateral")
    .replace(" top view", " vista superior")
    .replace(" with accessories", " con accesorios")
    .replace(" with carafe", " con jarra")
    .replace(" detail", " detalle")
    .replace(" closed", " cerrado")
    .replace(" open", " abierto")
    .replace(" interior", " interior")
    .replace(" dispenser", " dispensador")
    .replace(" cooktop", " superficie de coccion")
    .replace(" installed", " instalado")
    .replace(" blending", " en uso")
    .replace(" controls", " controles")
    .replace(" accessories", " accesorios")
    .replace(" in use", " en uso")
    .replace(" with bowl", " con tazon")
    .replace(" attachments", " accesorios")
    .replace(" cooking", " cocinando")
    .replace(" front", " frontal");
}

function mapBadge(badge: ProductBadge | null): Product["badge"] {
  switch (badge) {
    case ProductBadge.SALE:
      return "Oferta";
    case ProductBadge.JUST_IN:
      return "Recien llegado";
    case ProductBadge.BEST_SELLER:
      return "Mas vendido";
    default:
      return undefined;
  }
}

function mapStaticBadge(badge?: string): Product["badge"] {
  switch (badge) {
    case "Sale":
      return "Oferta";
    case "Just In":
      return "Recien llegado";
    case "Best Seller":
      return "Mas vendido";
    default:
      return undefined;
  }
}

function getProductColorEntries(product: Product) {
  const colorsByValue = new Map<
    string,
    { label: string; value: string; swatchValue: string }
  >();

  const registerColor = (label: string, colorValue?: string | null) => {
    const normalizedLabel = label.trim();

    if (!normalizedLabel) {
      return;
    }

    const value = buildProductColorFilterValue(normalizedLabel);

    if (colorsByValue.has(value)) {
      return;
    }

    colorsByValue.set(value, {
      label: normalizedLabel,
      value,
      swatchValue: resolveProductColorValue(normalizedLabel, colorValue),
    });
  };

  registerColor(product.color, product.colorValue);

  for (const variant of product.variants) {
    registerColor(variant.label, variant.colorValue);
  }

  return Array.from(colorsByValue.values());
}

function sortColorSuggestions(values: AdminColorSuggestion[]) {
  return [...values].sort((left, right) =>
    left.label.localeCompare(right.label, "es"),
  );
}

export function mapProduct(
  product: DatabaseProduct,
  activeExchangeRate: number | null,
): Product {
  const parentCategory = product.category.parent?.name ?? product.category.name;
  const leafCategory = product.category.name;
  const translation = PRODUCT_TRANSLATIONS[product.slug];
  const priceUsd = Number(product.price);
  const originalPriceUsd = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : undefined;
  const priceVes = resolveVesAmount(
    Number(product.priceVes),
    priceUsd,
    activeExchangeRate,
  );
  const originalPriceVes = originalPriceUsd
    ? resolveVesAmount(
        product.compareAtPriceVes
          ? Number(product.compareAtPriceVes)
          : undefined,
        originalPriceUsd,
        activeExchangeRate,
      )
    : undefined;

  return {
    id: product.sku,
    databaseId: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    brand: toBrand(product.brand.name),
    category: parentCategory,
    subcategory: leafCategory,
    price: priceUsd,
    priceUsd,
    priceVes,
    originalPrice: originalPriceUsd,
    originalPriceUsd,
    originalPriceVes,
    description: translation?.description ?? product.description,
    features: translation?.features ?? product.features,
    color: translateTerm(product.primaryColor ?? ""),
    colorValue: product.primaryColor
      ? resolveProductColorValue(
          product.primaryColor,
          product.primaryColorValue,
        )
      : null,
    style: product.modelNumber ?? "",
    images: product.images.map((image) => ({
      src: image.url,
      alt: translateImageAlt(image.altText),
      variantLabels: image.variantAssignments.map((assignment) =>
        translateTerm(assignment.productVariant.label),
      ),
    })),
    variants: product.variants.map((variant) => ({
      label: translateTerm(variant.label),
      colorValue: resolveProductColorValue(variant.label, variant.colorValue),
      available: variant.available,
    })),
    reviews: {
      rating: Number(product.averageRating),
      count: product.reviewCount,
    },
    badge: mapBadge(product.badge),
    inStock: product.stockQuantity > 0,
    shippingInfo: translateShippingInfo(product.shippingInfo),
  };
}

function mapStaticProduct(
  product: StaticCatalogProduct,
  activeExchangeRate: number | null,
): Product {
  const translation = PRODUCT_TRANSLATIONS[product.slug];
  const priceUsd = product.price;
  const originalPriceUsd = product.originalPrice;
  const priceVes = resolveVesAmount(undefined, priceUsd, activeExchangeRate);
  const originalPriceVes = originalPriceUsd
    ? resolveVesAmount(undefined, originalPriceUsd, activeExchangeRate)
    : undefined;

  return {
    id: product.id,
    databaseId: product.id,
    sku: product.id,
    slug: product.slug,
    name: product.name,
    brand: toBrand(product.brand),
    category: product.category,
    subcategory: product.subcategory,
    price: priceUsd,
    priceUsd,
    priceVes,
    originalPrice: originalPriceUsd,
    originalPriceUsd,
    originalPriceVes,
    description: translation?.description ?? product.description,
    features: translation?.features ?? product.features,
    color: translateTerm(product.color),
    colorValue: resolveProductColorValue(product.color, null),
    style: product.style,
    images: product.images.map((image) => ({
      src: image.src,
      alt: translateImageAlt(image.alt),
      variantLabels: [],
    })),
    variants: product.variants.map((variant) => ({
      label: translateTerm(variant.label),
      colorValue: resolveProductColorValue(variant.label, null),
      available: variant.available,
    })),
    reviews: {
      rating: product.reviews.rating,
      count: product.reviews.count,
    },
    badge: mapStaticBadge(product.badge),
    inStock: product.inStock,
    shippingInfo: translateShippingInfo(product.shippingInfo),
  };
}

function getStaticProducts(activeExchangeRate: number | null): Product[] {
  return staticCatalogProducts.map((product) =>
    mapStaticProduct(product, activeExchangeRate),
  );
}

function mapAdminStatus(status: ProductStatus): AdminProduct["status"] {
  switch (status) {
    case ProductStatus.ACTIVE:
      return "active";
    case ProductStatus.ARCHIVED:
      return "archived";
    case ProductStatus.DRAFT:
      return "draft";
  }
}

function mapAdminBadge(
  badge: ProductBadge | null,
): AdminProductPromotionBadge {
  switch (badge) {
    case ProductBadge.SALE:
      return "sale";
    case ProductBadge.JUST_IN:
      return "just_in";
    case ProductBadge.BEST_SELLER:
      return "best_seller";
    default:
      return null;
  }
}

const fetchProducts = cache(async () => {
  return prisma.product.findMany({
    where: {
      status: ProductStatus.ACTIVE,
    },
    include: productInclude,
    orderBy: [
      {
        featuredRank: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
});

const fetchActiveExchangeRate = cache(async () => {
  return prisma.exchangeRate.findFirst({
    where: {
      baseCurrency: "USD",
      quoteCurrency: "VES",
      isActive: true,
    },
    orderBy: [{ effectiveAt: "desc" }, { createdAt: "desc" }],
    select: exchangeRateSelect,
  });
});

export const getActiveExchangeRateValue = cache(async (): Promise<number | null> => {
  return runStorefrontReadWithFallback(
    "active exchange rate",
    async () => {
      const exchangeRate = await fetchActiveExchangeRate();

      return exchangeRate ? Number(exchangeRate.rate) : null;
    },
    () => null,
  );
});

export const getAdminExchangeRate = cache(
  async (): Promise<AdminExchangeRate | null> => {
    const exchangeRate = await fetchActiveExchangeRate();

    if (!exchangeRate) {
      return null;
    }

    return {
      rate: Number(exchangeRate.rate),
      source: exchangeRate.source,
      effectiveAt: exchangeRate.effectiveAt.toISOString(),
      fetchedAt: exchangeRate.fetchedAt.toISOString(),
    };
  },
);

export const getProducts = cache(async (): Promise<Product[]> => {
  return runStorefrontReadWithFallback(
    "catalog products",
    async () => {
      const [products, activeExchangeRate] = await Promise.all([
        fetchProducts(),
        getActiveExchangeRateValue(),
      ]);

      return products.map((product) => mapProduct(product, activeExchangeRate));
    },
    async () => getStaticProducts(await getActiveExchangeRateValue()),
  );
});

export const getFeaturedProducts = cache(async (): Promise<Product[]> => {
  return runStorefrontReadWithFallback(
    "featured products",
    async () => {
      const [products, activeExchangeRate] = await Promise.all([
        prisma.product.findMany({
          where: {
            status: ProductStatus.ACTIVE,
            featuredRank: {
              not: null,
            },
          },
          include: productInclude,
          orderBy: [
            {
              featuredRank: "asc",
            },
            {
              createdAt: "desc",
            },
          ],
          take: 6,
        }),
        getActiveExchangeRateValue(),
      ]);

      return products.map((product) => mapProduct(product, activeExchangeRate));
    },
    async () => getStaticProducts(await getActiveExchangeRateValue()).slice(0, 6),
  );
});

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    return runStorefrontReadWithFallback(
      `product by slug (${slug})`,
      async () => {
        const [product, activeExchangeRate] = await Promise.all([
          prisma.product.findUnique({
            where: {
              slug,
            },
            include: productInclude,
          }),
          getActiveExchangeRateValue(),
        ]);

        if (!product || product.status !== ProductStatus.ACTIVE) {
          return null;
        }

        return mapProduct(product, activeExchangeRate);
      },
      async () =>
        getStaticProducts(await getActiveExchangeRateValue()).find(
          (product) => product.slug === slug,
        ) ?? null,
    );
  },
);

export const getAdminBrands = cache(async (): Promise<string[]> => {
  const brands = await prisma.brand.findMany({
    select: {
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return brands.map((brand) => brand.name);
});

export const getAdminCategoryLabelSuggestions = cache(
  async (): Promise<string[]> => {
    const products = await prisma.product.findMany({
      select: {
        categoryLabels: true,
      },
    });

    const uniqueLabels = new Set<string>();

    for (const product of products) {
      const labels = Array.isArray(product.categoryLabels)
        ? product.categoryLabels
        : [];

      for (const label of labels) {
        const normalizedLabel = label.trim().replace(/\s+/g, " ");

        if (!normalizedLabel) {
          continue;
        }

        uniqueLabels.add(normalizedLabel);
      }
    }

    return Array.from(uniqueLabels).sort((left, right) =>
      left.localeCompare(right, "es"),
    );
  },
);

export const getAdminColorSuggestions = cache(
  async (): Promise<AdminColorSuggestion[]> => {
    const variants = await prisma.productVariant.findMany({
      select: {
        label: true,
        colorValue: true,
      },
      orderBy: {
        label: "asc",
      },
    });

    const suggestionsByLabel = new Map<string, AdminColorSuggestion>();

    for (const color of PREDEFINED_PRODUCT_COLORS) {
      suggestionsByLabel.set(color.label.toLocaleLowerCase("es"), color);
    }

    for (const variant of variants) {
      const normalizedLabel = variant.label.trim();

      if (!normalizedLabel) {
        continue;
      }

      const key = normalizedLabel.toLocaleLowerCase("es");

      if (!suggestionsByLabel.has(key)) {
        suggestionsByLabel.set(key, {
          label: normalizedLabel,
          colorValue: resolveProductColorValue(
            normalizedLabel,
            variant.colorValue,
          ),
        });
      }
    }

    return sortColorSuggestions(Array.from(suggestionsByLabel.values()));
  },
);


export const getFilterGroups = cache(async (): Promise<FilterGroup[]> => {
  const products = await getProducts();
  const brandOptions = Array.from(
    new Set(products.map((product) => product.brand)),
  )
    .sort((left, right) => left.localeCompare(right, "es"))
    .map((brand) => ({
      label: brand,
      value: getBrandQueryValue(brand),
      count: products.filter((product) => product.brand === brand).length,
    }));

  return [
    {
      name: "Marca",
      key: "brand",
      options: brandOptions,
    },
    {
      name: "Categoria",
      key: "category",
      options: Array.from(
        new Set(products.map((product) => product.subcategory)),
      )
        .sort((left, right) => left.localeCompare(right, "es"))
        .map((category) => ({
          label: category,
          value: category,
          count: products.filter((product) => product.subcategory === category)
            .length,
        }))
        .filter((option) => option.count > 0),
    },
    {
      name: "Comprar por precio",
      key: "price",
      options: PRICE_FILTERS.map((range) => ({
        label: range.label,
        value: range.value,
        count: products.filter((product) => range.matches(product.price))
          .length,
      })),
    },
    {
      name: "Ofertas y promociones",
      key: "sale",
      options: [
        {
          label: "En oferta",
          value: "sale",
          count: products.filter(
            (product) =>
              product.badge === "Oferta" || product.originalPrice !== undefined,
          ).length,
        },
        {
          label: "Recien llegados",
          value: "new",
          count: products.filter(
            (product) => product.badge === "Recien llegado",
          ).length,
        },
      ],
    },
    {
      name: "Color",
      key: "color",
      options: Array.from(
        products.reduce(
          (optionsByValue, product) => {
            for (const color of getProductColorEntries(product)) {
              const existingOption = optionsByValue.get(color.value);

              if (existingOption) {
                existingOption.productIds.add(product.databaseId);
                continue;
              }

              optionsByValue.set(color.value, {
                label: color.label,
                value: color.value,
                swatchValue: color.swatchValue,
                productIds: new Set([product.databaseId]),
              });
            }

            return optionsByValue;
          },
          new Map<
            string,
            {
              label: string;
              value: string;
              swatchValue: string;
              productIds: Set<string>;
            }
          >(),
        ).values(),
      )
        .map((option) => ({
          label: option.label,
          value: option.value,
          swatchValue: option.swatchValue,
          count: option.productIds.size,
        }))
        .filter((option) => option.count > 0)
        .sort((left, right) => left.label.localeCompare(right.label, "es")),
    },
  ];
});

export const getAdminProducts = cache(async (): Promise<AdminProduct[]> => {
  const [products, exchangeRate] = await Promise.all([
    prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: {
            sortOrder: "asc",
          },
          take: 1,
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    fetchActiveExchangeRate(),
  ]);
  const activeExchangeRate = exchangeRate ? Number(exchangeRate.rate) : null;

  return products.map((product) => {
    const categoryLabels = normalizeCategoryLabels(
      product.category.name,
      Array.isArray(product.categoryLabels)
        ? product.categoryLabels.filter(Boolean)
        : [],
    );
    const priceUsd = Number(product.price);
    const priceVes = resolveVesAmount(
      Number(product.priceVes),
      priceUsd,
      activeExchangeRate,
    );

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.images[0]?.url ?? null,
      brand: toBrand(product.brand.name),
      categories: [product.category.name, ...categoryLabels],
      category: product.category.name,
      price: priceUsd,
      priceUsd,
      priceVes,
      stock: product.stockQuantity,
      status: mapAdminStatus(product.status),
      featuredRank: product.featuredRank,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  });
});

export const getAdminProductById = cache(
  async (productId: string): Promise<AdminProductEditorData | null> => {
    const [product, exchangeRate] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          brand: true,
          category: true,
          reviews: {
            orderBy: {
              createdAt: "desc",
            },
          },
          variants: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          images: {
            include: {
              variantAssignments: {
                include: {
                  productVariant: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      }),
      fetchActiveExchangeRate(),
    ]);

    if (!product) {
      return null;
    }

    const activeExchangeRate = exchangeRate ? Number(exchangeRate.rate) : null;
    const categoryLabels = normalizeCategoryLabels(
      product.category.name,
      Array.isArray(product.categoryLabels)
        ? product.categoryLabels.filter(Boolean)
        : [],
    );
    const colors: AdminProductEditorColor[] = product.variants.map((variant) => ({
      id: variant.id,
      label: variant.label,
      colorValue: resolveProductColorValue(variant.label, variant.colorValue),
      available: variant.available,
    }));
    const reviews: AdminProductEditorReview[] = product.reviews.map((review) => ({
      id: review.id,
      reviewerName: review.reviewerName ?? "",
      title: review.title ?? "",
      body: review.body ?? "",
      rating: review.rating,
      isPublished: review.isPublished,
      createdAt: review.createdAt.toISOString(),
    }));
    const priceUsd = Number(product.price);
    const compareAtPriceUsd = product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null;

    return {
      id: product.id,
      name: product.name,
      brand: toBrand(product.brand.name),
      primaryCategoryId: product.category.id,
      primaryCategoryName: product.category.name,
      categoryLabels,
      primaryColor: product.primaryColor,
      primaryColorValue: product.primaryColorValue,
      colors,
      priceUsd,
      priceVes: resolveVesAmount(
        Number(product.priceVes),
        priceUsd,
        activeExchangeRate,
      ),
      compareAtPriceUsd,
      compareAtPriceVes:
        compareAtPriceUsd === null && !product.compareAtPriceVes
          ? null
          : resolveVesAmount(
              product.compareAtPriceVes
                ? Number(product.compareAtPriceVes)
                : undefined,
              compareAtPriceUsd ?? 0,
              activeExchangeRate,
            ),
      stock: product.stockQuantity,
      status: mapAdminStatus(product.status),
      badge: mapAdminBadge(product.badge),
      featuredRank: product.featuredRank,
      description: product.description,
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        altText: image.altText,
        colorIds: image.variantAssignments.map(
          (assignment) => assignment.productVariant.id,
        ),
      })),
      reviews,
    };
  },
);
