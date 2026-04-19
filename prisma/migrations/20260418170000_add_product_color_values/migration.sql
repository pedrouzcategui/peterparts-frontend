ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "primaryColorValue" TEXT;

ALTER TABLE "ProductVariant"
ADD COLUMN IF NOT EXISTS "colorValue" TEXT;

UPDATE "ProductVariant"
SET "colorValue" = CASE
  WHEN lower("label") LIKE '%stainless%' OR lower("label") LIKE '%inoxidable%' OR lower("label") LIKE '%chrome%' THEN '#cfd3d7'
  WHEN lower("label") LIKE '%black%' OR lower("label") LIKE '%onyx%' OR lower("label") LIKE '%negro%' THEN '#1a1714'
  WHEN lower("label") LIKE '%white%' OR lower("label") LIKE '%blanco%' THEN '#f8f7f3'
  WHEN lower("label") LIKE '%red%' OR lower("label") LIKE '%rojo%' OR lower("label") LIKE '%empire%' THEN '#c61c31'
  WHEN lower("label") LIKE '%silver%' OR lower("label") LIKE '%plata%' THEN '#bcc4ce'
  WHEN lower("label") LIKE '%blue%' OR lower("label") LIKE '%azul%' OR lower("label") LIKE '%ice%' THEN '#7da6d9'
  WHEN lower("label") LIKE '%green%' OR lower("label") LIKE '%verde%' OR lower("label") LIKE '%pistachio%' THEN '#8ca37b'
  WHEN lower("label") LIKE '%cream%' OR lower("label") LIKE '%crema%' OR lower("label") LIKE '%beige%' THEN '#eadfc8'
  WHEN lower("label") LIKE '%gold%' OR lower("label") LIKE '%dorado%' THEN '#d5b25c'
  WHEN lower("label") LIKE '%gray%' OR lower("label") LIKE '%grey%' OR lower("label") LIKE '%gris%' THEN '#7e8791'
  ELSE '#cfd6dc'
END
WHERE "colorValue" IS NULL OR trim("colorValue") = '';

ALTER TABLE "ProductVariant"
ALTER COLUMN "colorValue" SET DEFAULT '#cfd6dc';

UPDATE "ProductVariant"
SET "colorValue" = '#cfd6dc'
WHERE "colorValue" IS NULL OR trim("colorValue") = '';

ALTER TABLE "ProductVariant"
ALTER COLUMN "colorValue" SET NOT NULL;

UPDATE "Product" AS product
SET "primaryColorValue" = variant."colorValue"
FROM "ProductVariant" AS variant
WHERE variant."productId" = product."id"
  AND product."primaryColor" IS NOT NULL
  AND lower(trim(variant."label")) = lower(trim(product."primaryColor"))
  AND (product."primaryColorValue" IS NULL OR trim(product."primaryColorValue") = '');

UPDATE "Product"
SET "primaryColorValue" = CASE
  WHEN lower("primaryColor") LIKE '%stainless%' OR lower("primaryColor") LIKE '%inoxidable%' OR lower("primaryColor") LIKE '%chrome%' THEN '#cfd3d7'
  WHEN lower("primaryColor") LIKE '%black%' OR lower("primaryColor") LIKE '%onyx%' OR lower("primaryColor") LIKE '%negro%' THEN '#1a1714'
  WHEN lower("primaryColor") LIKE '%white%' OR lower("primaryColor") LIKE '%blanco%' THEN '#f8f7f3'
  WHEN lower("primaryColor") LIKE '%red%' OR lower("primaryColor") LIKE '%rojo%' OR lower("primaryColor") LIKE '%empire%' THEN '#c61c31'
  WHEN lower("primaryColor") LIKE '%silver%' OR lower("primaryColor") LIKE '%plata%' THEN '#bcc4ce'
  WHEN lower("primaryColor") LIKE '%blue%' OR lower("primaryColor") LIKE '%azul%' OR lower("primaryColor") LIKE '%ice%' THEN '#7da6d9'
  WHEN lower("primaryColor") LIKE '%green%' OR lower("primaryColor") LIKE '%verde%' OR lower("primaryColor") LIKE '%pistachio%' THEN '#8ca37b'
  WHEN lower("primaryColor") LIKE '%cream%' OR lower("primaryColor") LIKE '%crema%' OR lower("primaryColor") LIKE '%beige%' THEN '#eadfc8'
  WHEN lower("primaryColor") LIKE '%gold%' OR lower("primaryColor") LIKE '%dorado%' THEN '#d5b25c'
  WHEN lower("primaryColor") LIKE '%gray%' OR lower("primaryColor") LIKE '%grey%' OR lower("primaryColor") LIKE '%gris%' THEN '#7e8791'
  ELSE '#cfd6dc'
END
WHERE ("primaryColorValue" IS NULL OR trim("primaryColorValue") = '')
  AND "primaryColor" IS NOT NULL
  AND trim("primaryColor") <> '';

CREATE INDEX IF NOT EXISTS "Product_primaryColorValue_idx"
ON "Product" ("primaryColorValue");

CREATE INDEX IF NOT EXISTS "ProductVariant_colorValue_idx"
ON "ProductVariant" ("colorValue");
