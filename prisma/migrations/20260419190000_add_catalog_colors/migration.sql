CREATE TABLE IF NOT EXISTS "CatalogColor" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "normalizedLabel" TEXT NOT NULL,
  "colorValue" TEXT NOT NULL,
  "isBasePalette" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CatalogColor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CatalogColor_label_key"
ON "CatalogColor"("label");

CREATE UNIQUE INDEX IF NOT EXISTS "CatalogColor_normalizedLabel_key"
ON "CatalogColor"("normalizedLabel");

CREATE INDEX IF NOT EXISTS "CatalogColor_isBasePalette_idx"
ON "CatalogColor"("isBasePalette");

CREATE INDEX IF NOT EXISTS "CatalogColor_createdAt_idx"
ON "CatalogColor"("createdAt");