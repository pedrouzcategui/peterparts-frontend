"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminTagInput from "@/components/admin/AdminTagInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  cloneStorefrontSettings,
  type StorefrontPickupLocation,
  type StorefrontSettings,
} from "@/lib/storefront-settings";

function textareaClassName() {
  return "flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6";
}

function inputClassName() {
  return "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
}

interface AdminStorefrontSettingsClientProps {
  initialSettings: StorefrontSettings;
}

function createEmptyLocation(): StorefrontPickupLocation {
  return {
    name: "",
    description: "",
    latitude: 10.5,
    longitude: -66.9,
  };
}

export default function AdminStorefrontSettingsClient({
  initialSettings,
}: AdminStorefrontSettingsClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<StorefrontSettings>(() =>
    cloneStorefrontSettings(initialSettings),
  );
  const [isSaving, startTransition] = useTransition();

  const updateField = <Key extends keyof StorefrontSettings>(
    key: Key,
    value: StorefrontSettings[Key],
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  const updateLocation = <Key extends keyof StorefrontPickupLocation>(
    index: number,
    key: Key,
    value: StorefrontPickupLocation[Key],
  ) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      pickupLocations: currentSettings.pickupLocations.map(
        (location, locationIndex) =>
          locationIndex === index
            ? {
                ...location,
                [key]: value,
              }
            : location,
      ),
    }));
  };

  const handleAddLocation = () => {
    updateField("pickupLocations", [
      ...settings.pickupLocations,
      createEmptyLocation(),
    ]);
  };

  const handleRemoveLocation = (index: number) => {
    updateField(
      "pickupLocations",
      settings.pickupLocations.filter(
        (_, locationIndex) => locationIndex !== index,
      ),
    );
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/admin/storefront-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        settings?: StorefrontSettings;
      } | null;

      if (!response.ok || !result?.settings) {
        throw new Error(
          result?.message ?? "No se pudo guardar la configuracion.",
        );
      }

      setSettings(cloneStorefrontSettings(result.settings));
      toast.success("Configuracion de tienda actualizada.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuracion.",
      );
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuracion de tienda</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estos datos se muestran en todos los productos dentro del bloque de
            compra, despacho y soporte.
          </p>
        </div>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ubicacion y entregas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Introduccion</label>
            <textarea
              className={textareaClassName()}
              value={settings.locationIntro}
              onChange={(event) =>
                updateField("locationIntro", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Nota de delivery</label>
            <textarea
              className={textareaClassName()}
              value={settings.deliveryNote}
              onChange={(event) =>
                updateField("deliveryNote", event.target.value)
              }
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold">Ubicaciones del mapa</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLocation}
              >
                <Plus className="h-4 w-4" />
                Agregar ubicacion
              </Button>
            </div>

            {settings.pickupLocations.map((location, index) => (
              <div
                key={`${location.name}-${index}`}
                className="rounded-2xl border p-4"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Punto #{index + 1}</p>
                  {settings.pickupLocations.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLocation(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Nombre</label>
                    <input
                      className={inputClassName()}
                      value={location.name}
                      onChange={(event) =>
                        updateLocation(index, "name", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Descripcion</label>
                    <textarea
                      className={textareaClassName()}
                      value={location.description}
                      onChange={(event) =>
                        updateLocation(index, "description", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Latitud</label>
                    <input
                      type="number"
                      step="0.000001"
                      className={inputClassName()}
                      value={location.latitude}
                      onChange={(event) =>
                        updateLocation(
                          index,
                          "latitude",
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Longitud</label>
                    <input
                      type="number"
                      step="0.000001"
                      className={inputClassName()}
                      value={location.longitude}
                      onChange={(event) =>
                        updateLocation(
                          index,
                          "longitude",
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Etiqueta</label>
                <input
                  className={inputClassName()}
                  value={settings.scheduleWeekdaysLabel}
                  onChange={(event) =>
                    updateField("scheduleWeekdaysLabel", event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Horario</label>
                <input
                  className={inputClassName()}
                  value={settings.scheduleWeekdaysHours}
                  onChange={(event) =>
                    updateField("scheduleWeekdaysHours", event.target.value)
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nota fin de semana / feriados
              </label>
              <textarea
                className={textareaClassName()}
                value={settings.scheduleWeekendNote}
                onChange={(event) =>
                  updateField("scheduleWeekendNote", event.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asesoria tecnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Titulo</label>
              <input
                className={inputClassName()}
                value={settings.supportTitle}
                onChange={(event) =>
                  updateField("supportTitle", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripcion</label>
              <textarea
                className={textareaClassName()}
                value={settings.supportDescription}
                onChange={(event) =>
                  updateField("supportDescription", event.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mensaje destacado</label>
              <textarea
                className={textareaClassName()}
                value={settings.supportHighlight}
                onChange={(event) =>
                  updateField("supportHighlight", event.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Metodos de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminTagInput
              id="payment-methods-foreign"
              label="Divisas"
              values={settings.paymentMethodsForeign}
              placeholder="Escribe una opcion y usa coma"
              onChange={(values) =>
                updateField("paymentMethodsForeign", values)
              }
            />
            <AdminTagInput
              id="payment-methods-bolivar"
              label="Bolivar digital"
              values={settings.paymentMethodsBolivar}
              placeholder="Escribe un banco y usa coma"
              onChange={(values) =>
                updateField("paymentMethodsBolivar", values)
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metodos de despacho</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminTagInput
              id="dispatch-methods"
              label="Opciones principales"
              values={settings.dispatchMethods}
              placeholder="Escribe una opcion y usa coma"
              onChange={(values) => updateField("dispatchMethods", values)}
            />
            <AdminTagInput
              id="national-carriers"
              label="Operadores nacionales"
              values={settings.nationalCarriers}
              placeholder="Escribe un operador y usa coma"
              onChange={(values) => updateField("nationalCarriers", values)}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
