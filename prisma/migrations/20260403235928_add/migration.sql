-- CreateTable
CREATE TABLE "StorefrontSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "locationIntro" TEXT NOT NULL,
    "deliveryNote" TEXT NOT NULL,
    "scheduleWeekdaysLabel" TEXT NOT NULL,
    "scheduleWeekdaysHours" TEXT NOT NULL,
    "scheduleWeekendNote" TEXT NOT NULL,
    "paymentMethodsForeign" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentMethodsBolivar" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dispatchMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "nationalCarriers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportTitle" TEXT NOT NULL,
    "supportDescription" TEXT NOT NULL,
    "supportHighlight" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorefrontSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupLocation" (
    "id" TEXT NOT NULL,
    "storefrontSettingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorefrontSetting_key_key" ON "StorefrontSetting"("key");

-- CreateIndex
CREATE INDEX "PickupLocation_storefrontSettingId_idx" ON "PickupLocation"("storefrontSettingId");

-- CreateIndex
CREATE UNIQUE INDEX "PickupLocation_storefrontSettingId_sortOrder_key" ON "PickupLocation"("storefrontSettingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "PickupLocation" ADD CONSTRAINT "PickupLocation_storefrontSettingId_fkey" FOREIGN KEY ("storefrontSettingId") REFERENCES "StorefrontSetting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
