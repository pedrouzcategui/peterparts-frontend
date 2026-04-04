ALTER TABLE "rate_exchange" RENAME TO "ExchangeRate";

ALTER INDEX "rate_exchange_pkey" RENAME TO "ExchangeRate_pkey";
ALTER INDEX "rate_exchange_baseCurrency_quoteCurrency_isActive_idx" RENAME TO "ExchangeRate_baseCurrency_quoteCurrency_isActive_idx";
ALTER INDEX "rate_exchange_effectiveAt_idx" RENAME TO "ExchangeRate_effectiveAt_idx";