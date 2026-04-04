import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApiAccess } from "@/lib/auth/admin";
import {
  cloneStorefrontSettings,
  normalizeStorefrontSettings,
  type StorefrontSettings,
} from "@/lib/storefront-settings";
import {
  getStorefrontSettings,
  saveStorefrontSettings,
} from "@/lib/storefront-settings-store";

export const runtime = "nodejs";

function isValidSettingsPayload(value: unknown): value is StorefrontSettings {
  if (!value || typeof value !== "object") {
    return false;
  }

  const settings = value as Partial<StorefrontSettings>;

  return (
    typeof settings.locationIntro === "string" &&
    typeof settings.deliveryNote === "string" &&
    typeof settings.scheduleWeekdaysLabel === "string" &&
    typeof settings.scheduleWeekdaysHours === "string" &&
    typeof settings.scheduleWeekendNote === "string" &&
    Array.isArray(settings.paymentMethodsForeign) &&
    Array.isArray(settings.paymentMethodsBolivar) &&
    Array.isArray(settings.dispatchMethods) &&
    Array.isArray(settings.nationalCarriers) &&
    typeof settings.supportTitle === "string" &&
    typeof settings.supportDescription === "string" &&
    typeof settings.supportHighlight === "string" &&
    Array.isArray(settings.pickupLocations)
  );
}

export async function GET() {
  const access = await requireAdminApiAccess("/admin/settings");

  if (!access.ok) {
    return access.response;
  }

  const settings = await getStorefrontSettings();
  return NextResponse.json({ settings }, { status: 200 });
}

export async function PUT(request: Request) {
  const access = await requireAdminApiAccess("/admin/settings");

  if (!access.ok) {
    return access.response;
  }

  const body = (await request.json().catch(() => null)) as unknown;

  if (!isValidSettingsPayload(body)) {
    return NextResponse.json(
      { message: "Los datos enviados no tienen el formato esperado." },
      { status: 400 },
    );
  }

  const normalizedSettings = normalizeStorefrontSettings(
    cloneStorefrontSettings(body),
  );

  if (!normalizedSettings.locationIntro) {
    return NextResponse.json(
      { message: "La introduccion de ubicacion es obligatoria." },
      { status: 400 },
    );
  }

  if (normalizedSettings.pickupLocations.length === 0) {
    return NextResponse.json(
      { message: "Agrega al menos una ubicacion para el mapa." },
      { status: 400 },
    );
  }

  if (
    !normalizedSettings.supportTitle ||
    !normalizedSettings.supportDescription
  ) {
    return NextResponse.json(
      { message: "Completa el bloque de asesoria tecnica." },
      { status: 400 },
    );
  }

  const settings = await saveStorefrontSettings(normalizedSettings);

  revalidatePath("/admin/settings");
  revalidatePath("/products");

  return NextResponse.json({ settings }, { status: 200 });
}
