CREATE TABLE IF NOT EXISTS "ProductImageVariantAssignment" (
  "productImageId" TEXT NOT NULL,
  "productVariantId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProductImageVariantAssignment_pkey" PRIMARY KEY ("productImageId", "productVariantId"),
  CONSTRAINT "ProductImageVariantAssignment_productImageId_fkey" FOREIGN KEY ("productImageId") REFERENCES "ProductImage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProductImageVariantAssignment_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProductImageVariantAssignment_productVariantId_idx"
ON "ProductImageVariantAssignment" ("productVariantId");
