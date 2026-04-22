export interface StorefrontPickupLocation {
  id?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface StorefrontSettings {
  key: string;
  locationIntro: string;
  deliveryNote: string;
  scheduleWeekdaysLabel: string;
  scheduleWeekdaysHours: string;
  scheduleWeekendNote: string;
  paymentMethodsForeign: string[];
  paymentMethodsBolivar: string[];
  dispatchMethods: string[];
  nationalCarriers: string[];
  supportTitle: string;
  supportDescription: string;
  supportHighlight: string;
  pickupLocations: StorefrontPickupLocation[];
}

export const STOREFRONT_SETTINGS_KEY = "default";

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  key: STOREFRONT_SETTINGS_KEY,
  locationIntro:
    "Trabajamos con entregas personales en Caracas y Los Altos Mirandinos. También coordinamos delivery en Caracas según la zona y la disponibilidad del día.",
  deliveryNote:
    "Podemos coordinar delivery en Caracas. El costo depende del lugar de entrega y del horario acordado.",
  scheduleWeekdaysLabel: "Lunes a viernes",
  scheduleWeekdaysHours: "8:00am a 6:00pm",
  scheduleWeekendNote:
    "No laboramos fines de semana ni feriados, pero podemos responder sus preguntas y orientar su compra.",
  paymentMethodsForeign: ["Efectivo", "Zelle", "Banesco Panama"],
  paymentMethodsBolivar: [
    "Mercantil",
    "Provincial",
    "Banco de Venezuela",
    "BFC",
    "Banesco",
  ],
  dispatchMethods: [
    "Retiro personalmente en nuestra oficina",
    "Servicio motorizado (favor consultar costo)",
    "Envíos cobro en destino a nivel nacional",
  ],
  nationalCarriers: ["MRW", "Zoom", "Tealca"],
  supportTitle: "Asesoría técnica gratuita por WhatsApp",
  supportDescription:
    "Le brindamos asesoría técnica gratuita vía telefónica y por WhatsApp. Respondemos sus dudas para ayudarle con la reparación de su batidora, la compatibilidad del repuesto y la selección correcta de engranajes o piezas.",
  supportHighlight:
    "Antes de comprar, puede escribirnos con el modelo del equipo o una foto de la pieza para validar compatibilidad y reducir errores en el pedido.",
  pickupLocations: [
    {
      name: "San Bernardino, Caracas",
      description:
        "Entregas personales muy cerca del Instituto Diagnóstico - Caracas.",
      latitude: 10.5025,
      longitude: -66.8944,
    },
    {
      name: "Montaña Alta, Carrizal",
      description: "Punto de entrega coordinado en Montaña Alta, Carrizal.",
      latitude: 10.3471,
      longitude: -66.9246,
    },
  ],
};

export function cloneStorefrontSettings(
  settings: StorefrontSettings = DEFAULT_STOREFRONT_SETTINGS,
): StorefrontSettings {
  return {
    ...settings,
    paymentMethodsForeign: [...settings.paymentMethodsForeign],
    paymentMethodsBolivar: [...settings.paymentMethodsBolivar],
    dispatchMethods: [...settings.dispatchMethods],
    nationalCarriers: [...settings.nationalCarriers],
    pickupLocations: settings.pickupLocations.map((location) => ({
      ...location,
    })),
  };
}

function normalizeArray(values: string[]): string[] {
  const result: string[] = [];

  values.forEach((value) => {
    const trimmedValue = value.trim().replace(/\s+/g, " ");

    if (!trimmedValue) {
      return;
    }

    const alreadyIncluded = result.some(
      (currentValue) =>
        currentValue.toLowerCase() === trimmedValue.toLowerCase(),
    );

    if (!alreadyIncluded) {
      result.push(trimmedValue);
    }
  });

  return result;
}

export function normalizeStorefrontSettings(
  settings: StorefrontSettings,
): StorefrontSettings {
  return {
    key: settings.key.trim() || STOREFRONT_SETTINGS_KEY,
    locationIntro: settings.locationIntro.trim(),
    deliveryNote: settings.deliveryNote.trim(),
    scheduleWeekdaysLabel: settings.scheduleWeekdaysLabel.trim(),
    scheduleWeekdaysHours: settings.scheduleWeekdaysHours.trim(),
    scheduleWeekendNote: settings.scheduleWeekendNote.trim(),
    paymentMethodsForeign: normalizeArray(settings.paymentMethodsForeign),
    paymentMethodsBolivar: normalizeArray(settings.paymentMethodsBolivar),
    dispatchMethods: normalizeArray(settings.dispatchMethods),
    nationalCarriers: normalizeArray(settings.nationalCarriers),
    supportTitle: settings.supportTitle.trim(),
    supportDescription: settings.supportDescription.trim(),
    supportHighlight: settings.supportHighlight.trim(),
    pickupLocations: settings.pickupLocations
      .map((location) => ({
        id: location.id,
        name: location.name.trim(),
        description: location.description.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      }))
      .filter(
        (location) =>
          location.name &&
          location.description &&
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      ),
  };
}
