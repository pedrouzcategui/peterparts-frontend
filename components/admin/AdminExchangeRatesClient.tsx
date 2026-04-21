"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Loader2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminManagedExchangeRate } from "@/lib/admin-data";
import { formatExchangeRate } from "@/lib/currency";

interface ExchangeRateFormState {
  rate: string;
  source: string;
  effectiveAt: string;
  fetchedAt: string;
}

interface AdminExchangeRatesClientProps {
  initialExchangeRates: AdminManagedExchangeRate[];
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function sortExchangeRates(
  values: AdminManagedExchangeRate[],
): AdminManagedExchangeRate[] {
  return [...values].sort((left, right) => {
    if (left.isActive !== right.isActive) {
      return left.isActive ? -1 : 1;
    }

    return (
      new Date(right.effectiveAt).getTime() - new Date(left.effectiveAt).getTime()
    );
  });
}

function toDateTimeLocalValue(dateString: string): string {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function createNowDateTimeLocalValue(): string {
  return toDateTimeLocalValue(new Date().toISOString());
}

function createEmptyForm(): ExchangeRateFormState {
  const now = createNowDateTimeLocalValue();

  return {
    rate: "",
    source: "manual",
    effectiveAt: now,
    fetchedAt: now,
  };
}

function createFormFromExchangeRate(
  exchangeRate: AdminManagedExchangeRate,
): ExchangeRateFormState {
  return {
    rate: exchangeRate.rate.toFixed(6),
    source: exchangeRate.source ?? "manual",
    effectiveAt: toDateTimeLocalValue(exchangeRate.effectiveAt),
    fetchedAt: toDateTimeLocalValue(exchangeRate.fetchedAt),
  };
}

export default function AdminExchangeRatesClient({
  initialExchangeRates,
}: AdminExchangeRatesClientProps) {
  const router = useRouter();
  const [exchangeRates, setExchangeRates] = useState(() =>
    sortExchangeRates(initialExchangeRates),
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingExchangeRateId, setEditingExchangeRateId] = useState<string | null>(
    null,
  );
  const [formValues, setFormValues] = useState<ExchangeRateFormState>(
    createEmptyForm,
  );
  const [activationTargetId, setActivationTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const activeExchangeRate = useMemo(
    () => exchangeRates.find((exchangeRate) => exchangeRate.isActive) ?? null,
    [exchangeRates],
  );

  const stats = useMemo(
    () => ({
      totalRates: exchangeRates.length,
      lastUpdatedAt:
        exchangeRates[0]?.updatedAt ?? activeExchangeRate?.updatedAt ?? null,
    }),
    [activeExchangeRate?.updatedAt, exchangeRates],
  );

  const isBusy = isSaving || isActivating || isRefreshing;

  const handleInputChange = <Key extends keyof ExchangeRateFormState>(
    key: Key,
    value: ExchangeRateFormState[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditorMode("create");
    setEditingExchangeRateId(null);
    setFormValues(createEmptyForm());
    setIsEditorOpen(true);
  };

  const openEditDialog = (exchangeRate: AdminManagedExchangeRate) => {
    setEditorMode("edit");
    setEditingExchangeRateId(exchangeRate.id);
    setFormValues(createFormFromExchangeRate(exchangeRate));
    setIsEditorOpen(true);
  };

  const closeEditor = (open: boolean) => {
    setIsEditorOpen(open);

    if (!open) {
      setEditingExchangeRateId(null);
      setFormValues(createEmptyForm());
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      const endpoint =
        editorMode === "create"
          ? "/api/admin/exchange-rates"
          : `/api/admin/exchange-rates/${editingExchangeRateId ?? ""}`;
      const method = editorMode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rate: formValues.rate,
          source: formValues.source,
          effectiveAt: formValues.effectiveAt,
          fetchedAt: formValues.fetchedAt,
        }),
      });

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        exchangeRate?: AdminManagedExchangeRate;
      } | null;

      if (!response.ok || !result?.exchangeRate) {
        throw new Error(result?.message ?? "No se pudo guardar la tasa.");
      }

      const savedExchangeRate = result.exchangeRate;

      setExchangeRates((currentExchangeRates) => {
        if (editorMode === "create") {
          return sortExchangeRates([
            savedExchangeRate,
            ...currentExchangeRates.map((exchangeRate) => ({
              ...exchangeRate,
              isActive: false,
            })),
          ]);
        }

        return sortExchangeRates(
          currentExchangeRates.map((exchangeRate) =>
            exchangeRate.id === savedExchangeRate.id
              ? savedExchangeRate
              : exchangeRate,
          ),
        );
      });

      toast.success(
        editorMode === "create"
          ? "Tasa registrada y activada correctamente."
          : "Tasa actualizada correctamente.",
      );
      closeEditor(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la tasa.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async (exchangeRateId: string) => {
    try {
      setActivationTargetId(exchangeRateId);
      setIsActivating(true);

      const response = await fetch(
        `/api/admin/exchange-rates/${exchangeRateId}/activate`,
        {
          method: "POST",
        },
      );

      const result = (await response.json().catch(() => null)) as {
        message?: string;
        exchangeRate?: AdminManagedExchangeRate;
      } | null;

      if (!response.ok || !result?.exchangeRate) {
        throw new Error(result?.message ?? "No se pudo activar la tasa.");
      }

      const activeExchangeRate = result.exchangeRate;

      setExchangeRates((currentExchangeRates) =>
        sortExchangeRates(
          currentExchangeRates.map((exchangeRate) => ({
            ...exchangeRate,
            isActive: exchangeRate.id === activeExchangeRate.id,
          })),
        ),
      );

      toast.success("La tasa seleccionada ya es la referencia activa.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo activar la tasa.",
      );
    } finally {
      setActivationTargetId(null);
      setIsActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exchange Rates</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Administra la tasa USD/VES que se usa como referencia al crear y editar
            productos. Cada nuevo registro se guarda en el historial y queda activo
            de inmediato.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreateDialog} disabled={isBusy}>
            <Plus className="h-4 w-4" />
            Nueva tasa
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Ver productos</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-[#e7dfd3] bg-[#fff9f4] dark:border-border dark:bg-card">
          <CardHeader>
            <CardTitle>Tasa activa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeExchangeRate ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ArrowLeftRight className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">
                      1 USD = {formatExchangeRate(activeExchangeRate.rate)} VES
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Fuente: {activeExchangeRate.source || "manual"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vigente desde {dateTimeFormatter.format(new Date(activeExchangeRate.effectiveAt))}.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Todavia no hay una tasa activa. Registra una para autocalcular los
                precios en bolivares desde los formularios de producto.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {stats.totalRates}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Registros USD/VES listos para consulta o reactivacion.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultima actualizacion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-foreground">
              {stats.lastUpdatedAt
                ? dateTimeFormatter.format(new Date(stats.lastUpdatedAt))
                : "Sin movimientos"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Los cambios se reflejan en el admin de productos en la siguiente carga.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tabla de tasas</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Par</TableHead>
                <TableHead>Tasa</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Registrada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((exchangeRate) => {
                const isActivatingCurrentRow =
                  isActivating && activationTargetId === exchangeRate.id;

                return (
                  <TableRow key={exchangeRate.id}>
                    <TableCell className="font-medium">
                      {exchangeRate.baseCurrency}/{exchangeRate.quoteCurrency}
                    </TableCell>
                    <TableCell>
                      {formatExchangeRate(exchangeRate.rate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exchangeRate.source || "manual"}
                    </TableCell>
                    <TableCell>
                      {dateTimeFormatter.format(new Date(exchangeRate.effectiveAt))}
                    </TableCell>
                    <TableCell>
                      {dateTimeFormatter.format(new Date(exchangeRate.fetchedAt))}
                    </TableCell>
                    <TableCell>
                      {exchangeRate.isActive ? (
                        <Badge>Activa</Badge>
                      ) : (
                        <Badge variant="outline">Historial</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditDialog(exchangeRate)}
                          aria-label={`Editar tasa ${exchangeRate.id}`}
                          disabled={isBusy}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleActivate(exchangeRate.id)}
                          disabled={isBusy || exchangeRate.isActive}
                        >
                          {isActivatingCurrentRow ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Activando...
                            </>
                          ) : exchangeRate.isActive ? (
                            "En uso"
                          ) : (
                            "Activar"
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {exchangeRates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aun no hay tasas registradas.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={closeEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editorMode === "create" ? "Nueva tasa" : "Editar tasa"}
            </DialogTitle>
            <DialogDescription>
              {editorMode === "create"
                ? "Registra una nueva tasa USD/VES. Al guardarla quedara activa para productos."
                : "Actualiza la tasa seleccionada sin perder su registro historico."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="exchange-rate-value" className="text-sm font-medium">
                Tasa USD a VES
              </label>
              <Input
                id="exchange-rate-value"
                type="number"
                step="0.000001"
                min="0"
                value={formValues.rate}
                onChange={(event) => handleInputChange("rate", event.target.value)}
                placeholder="36.500000"
                required
                disabled={isBusy}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="exchange-rate-source" className="text-sm font-medium">
                Fuente
              </label>
              <Input
                id="exchange-rate-source"
                value={formValues.source}
                onChange={(event) =>
                  handleInputChange("source", event.target.value)
                }
                placeholder="manual"
                disabled={isBusy}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="exchange-rate-effective-at"
                  className="text-sm font-medium"
                >
                  Fecha de vigencia
                </label>
                <Input
                  id="exchange-rate-effective-at"
                  type="datetime-local"
                  value={formValues.effectiveAt}
                  onChange={(event) =>
                    handleInputChange("effectiveAt", event.target.value)
                  }
                  required
                  disabled={isBusy}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="exchange-rate-fetched-at"
                  className="text-sm font-medium"
                >
                  Fecha de registro
                </label>
                <Input
                  id="exchange-rate-fetched-at"
                  type="datetime-local"
                  value={formValues.fetchedAt}
                  onChange={(event) =>
                    handleInputChange("fetchedAt", event.target.value)
                  }
                  required
                  disabled={isBusy}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => closeEditor(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isBusy}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : editorMode === "create" ? (
                  "Guardar y activar"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}