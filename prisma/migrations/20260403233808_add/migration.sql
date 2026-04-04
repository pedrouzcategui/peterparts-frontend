-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "compareAtPriceVes" DECIMAL(14,2),
ADD COLUMN     "priceVes" DECIMAL(14,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "rate_exchange" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'USD',
    "quoteCurrency" TEXT NOT NULL DEFAULT 'VES',
    "rate" DECIMAL(18,6) NOT NULL,
    "source" TEXT,
    "effectiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_exchange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rate_exchange_baseCurrency_quoteCurrency_isActive_idx" ON "rate_exchange"("baseCurrency", "quoteCurrency", "isActive");

-- CreateIndex
CREATE INDEX "rate_exchange_effectiveAt_idx" ON "rate_exchange"("effectiveAt");

-- CreateIndex
CREATE INDEX "Product_priceVes_idx" ON "Product"("priceVes");
