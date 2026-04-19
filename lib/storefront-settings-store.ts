import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { runStorefrontReadWithFallback } from "@/lib/storefront-query-resilience";
import {
  cloneStorefrontSettings,
  DEFAULT_STOREFRONT_SETTINGS,
  normalizeStorefrontSettings,
  STOREFRONT_SETTINGS_KEY,
  type StorefrontSettings,
} from "@/lib/storefront-settings";

const storefrontSettingInclude = {
  pickupLocations: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} as const;

function mapStorefrontSettings(
  record: NonNullable<Awaited<ReturnType<typeof fetchStorefrontSettings>>>,
): StorefrontSettings {
  return {
    key: record.key,
    locationIntro: record.locationIntro,
    deliveryNote: record.deliveryNote,
    scheduleWeekdaysLabel: record.scheduleWeekdaysLabel,
    scheduleWeekdaysHours: record.scheduleWeekdaysHours,
    scheduleWeekendNote: record.scheduleWeekendNote,
    paymentMethodsForeign: record.paymentMethodsForeign,
    paymentMethodsBolivar: record.paymentMethodsBolivar,
    dispatchMethods: record.dispatchMethods,
    nationalCarriers: record.nationalCarriers,
    supportTitle: record.supportTitle,
    supportDescription: record.supportDescription,
    supportHighlight: record.supportHighlight,
    pickupLocations: record.pickupLocations.map((location) => ({
      id: location.id,
      name: location.name,
      description: location.description,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    })),
  };
}

const fetchStorefrontSettings = cache(async () => {
  return prisma.storefrontSetting.findUnique({
    where: {
      key: STOREFRONT_SETTINGS_KEY,
    },
    include: storefrontSettingInclude,
  });
});

export const getStorefrontSettings = cache(
  async (): Promise<StorefrontSettings> => {
    return runStorefrontReadWithFallback(
      "storefront settings",
      async () => {
        const storefrontSettings = await fetchStorefrontSettings();

        if (!storefrontSettings) {
          return cloneStorefrontSettings(DEFAULT_STOREFRONT_SETTINGS);
        }

        return mapStorefrontSettings(storefrontSettings);
      },
      () => cloneStorefrontSettings(DEFAULT_STOREFRONT_SETTINGS),
    );
  },
);

export async function saveStorefrontSettings(
  input: StorefrontSettings,
): Promise<StorefrontSettings> {
  const settings = normalizeStorefrontSettings(input);

  const storefrontSettings = await prisma.storefrontSetting.upsert({
    where: {
      key: STOREFRONT_SETTINGS_KEY,
    },
    update: {
      locationIntro: settings.locationIntro,
      deliveryNote: settings.deliveryNote,
      scheduleWeekdaysLabel: settings.scheduleWeekdaysLabel,
      scheduleWeekdaysHours: settings.scheduleWeekdaysHours,
      scheduleWeekendNote: settings.scheduleWeekendNote,
      paymentMethodsForeign: settings.paymentMethodsForeign,
      paymentMethodsBolivar: settings.paymentMethodsBolivar,
      dispatchMethods: settings.dispatchMethods,
      nationalCarriers: settings.nationalCarriers,
      supportTitle: settings.supportTitle,
      supportDescription: settings.supportDescription,
      supportHighlight: settings.supportHighlight,
      pickupLocations: {
        deleteMany: {},
        create: settings.pickupLocations.map((location, index) => ({
          name: location.name,
          description: location.description,
          latitude: location.latitude.toFixed(6),
          longitude: location.longitude.toFixed(6),
          sortOrder: index,
        })),
      },
    },
    create: {
      key: STOREFRONT_SETTINGS_KEY,
      locationIntro: settings.locationIntro,
      deliveryNote: settings.deliveryNote,
      scheduleWeekdaysLabel: settings.scheduleWeekdaysLabel,
      scheduleWeekdaysHours: settings.scheduleWeekdaysHours,
      scheduleWeekendNote: settings.scheduleWeekendNote,
      paymentMethodsForeign: settings.paymentMethodsForeign,
      paymentMethodsBolivar: settings.paymentMethodsBolivar,
      dispatchMethods: settings.dispatchMethods,
      nationalCarriers: settings.nationalCarriers,
      supportTitle: settings.supportTitle,
      supportDescription: settings.supportDescription,
      supportHighlight: settings.supportHighlight,
      pickupLocations: {
        create: settings.pickupLocations.map((location, index) => ({
          name: location.name,
          description: location.description,
          latitude: location.latitude.toFixed(6),
          longitude: location.longitude.toFixed(6),
          sortOrder: index,
        })),
      },
    },
    include: storefrontSettingInclude,
  });

  return mapStorefrontSettings(storefrontSettings);
}
