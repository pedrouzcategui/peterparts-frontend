"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Palette,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminManagedColor } from "@/lib/admin-data";

interface AdminColorsClientProps {
  initialColors: AdminManagedColor[];
}

type ColorView = "all" | "used" | "predefined" | "unused";

const FILTER_LABELS: Record<ColorView, string> = {
  all: "Todas",
  used: "En catalogo",
  predefined: "Base Peter Parts",
  unused: "Sin uso",
};

const STATUS_LABELS = {
  active: "Activo",
  draft: "Borrador",
  archived: "Archivado",
} as const;

interface ColorFormState {
  label: string;
  colorValue: string;
  isBasePalette: boolean;
}

function statValueFormatter(value: number) {
  return new Intl.NumberFormat("es-VE").format(value);
}

function createEmptyForm(): ColorFormState {
  return {
    label: "",
    colorValue: "#cfd3d7",
    isBasePalette: false,
  };
}

function createFormFromColor(color: AdminManagedColor): ColorFormState {
  return {
    label: color.label,
    colorValue: color.colorValue,
    isBasePalette: color.isPredefined,
  };
}

function sortColors(values: AdminManagedColor[]) {
  return [...values].sort((left, right) => {
    if (left.productsCount === 0 && right.productsCount > 0) {
      return 1;
    }

    if (left.productsCount > 0 && right.productsCount === 0) {
      return -1;
    }

    return left.label.localeCompare(right.label, "es");
  });
}

function resolvePreviewColor(value: string) {
  const normalizedValue = value.trim();

  if (/^#[0-9a-fA-F]{3}$/.test(normalizedValue)) {
    const expanded = normalizedValue
      .slice(1)
      .split("")
      .map((character) => `${character}${character}`)
      .join("");

    return `#${expanded.toLowerCase()}`;
  }

  if (/^#[0-9a-fA-F]{6}$/.test(normalizedValue)) {
    return normalizedValue.toLowerCase();
  }

  return "#cfd3d7";
}

export default function AdminColorsClient({
  initialColors,
}: AdminColorsClientProps) {
  const router = useRouter();
  const [colors, setColors] = useState(() => sortColors(initialColors));
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<ColorView>("all");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<ColorFormState>(createEmptyForm);
  const [deleteTarget, setDeleteTarget] = useState<AdminManagedColor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const filteredColors = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    return colors.filter((color) => {
      if (view === "used" && color.productsCount === 0) {
        return false;
      }

      if (view === "predefined" && !color.isPredefined) {
        return false;
      }

      if (view === "unused" && color.productsCount > 0) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        color.label,
        color.colorValue,
        ...color.products.map((product) => `${product.name} ${product.brand}`),
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return haystack.includes(normalizedQuery);
    });
  }, [colors, searchQuery, view]);

  const stats = useMemo(
    () => ({
      totalColors: colors.length,
      usedColors: colors.filter((color) => color.productsCount > 0).length,
      predefinedColors: colors.filter((color) => color.isPredefined).length,
      totalVariants: colors.reduce((sum, color) => sum + color.variantCount, 0),
    }),
    [colors],
  );

  const isBusy = isSaving || isDeleting || isRefreshing;

  const handleInputChange = <Key extends keyof ColorFormState>(
    key: Key,
    value: ColorFormState[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditorMode("create");
    setEditingColorId(null);
    setFormValues(createEmptyForm());
    setIsEditorOpen(true);
  };

  const openEditDialog = (color: AdminManagedColor) => {
    setEditorMode("edit");
    setEditingColorId(color.id);
    setFormValues(createFormFromColor(color));
    setIsEditorOpen(true);
  };

  const closeEditor = (open: boolean) => {
    setIsEditorOpen(open);

    if (!open) {
      setEditingColorId(null);
      setFormValues(createEmptyForm());
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      const endpoint =
        editorMode === "create"
          ? "/api/admin/colors"
          : `/api/admin/colors/${editingColorId ?? ""}`;
      const method = editorMode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
        color?: AdminManagedColor;
      } | null;

      if (!response.ok || !result?.color) {
        throw new Error(result?.message ?? "No se pudo guardar el color.");
      }

      setColors((currentColors) => {
        if (editorMode === "create") {
          return sortColors([...currentColors, result.color]);
        }

        return sortColors(
          currentColors.map((color) =>
            color.id === result.color?.id ? result.color : color,
          ),
        );
      });

      toast.success(
        editorMode === "create"
          ? "Color creado correctamente."
          : "Color actualizado correctamente.",
      );
      closeEditor(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar el color.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/admin/colors/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "No se pudo eliminar el color.");
      }

      setColors((currentColors) =>
        currentColors.filter((color) => color.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Color eliminado correctamente.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar el color.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Colores</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Centraliza la biblioteca visual de acabados del catalogo. Aqui puedes
            revisar nombres, hex reales y en que productos ya se estan usando para
            mantener consistencia antes de editar cada ficha.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openCreateDialog} disabled={isBusy}>
            <Plus className="h-4 w-4" />
            Nuevo color
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">Ver productos</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">Nuevo producto</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-[#e7dfd3] bg-[#fff9f4] dark:border-border dark:bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Total de colores
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {statValueFormatter(stats.totalColors)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Colores en catalogo
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {statValueFormatter(stats.usedColors)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Con al menos un producto asociado.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Base Peter Parts
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {statValueFormatter(stats.predefinedColors)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Colores disponibles como referencia base.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Variantes registradas
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {statValueFormatter(stats.totalVariants)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Variantes de producto que usan estos tonos.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Biblioteca central</CardTitle>
            <CardDescription>
              Busca por nombre, valor hex o producto y filtra la paleta segun su
              origen o uso real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por color, hex o producto..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FILTER_LABELS) as ColorView[]).map((filterKey) => (
                <Button
                  key={filterKey}
                  type="button"
                  variant={view === filterKey ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  onClick={() => setView(filterKey)}
                >
                  {FILTER_LABELS[filterKey]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#eaded7] bg-[#fffaf6] dark:border-border dark:bg-card">
          <CardHeader>
            <CardTitle>Flujo sugerido</CardTitle>
            <CardDescription>
              Usa esta vista como referencia central antes de tocar los colores de
              un producto individual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Crea aqui nuevos colores de referencia para que aparezcan en toda la administracion.</p>
            <p>2. Si un color ya esta en uso, editarlo aqui actualiza tambien sus productos y variantes asociadas.</p>
            <p>3. Solo puedes eliminar colores sin uso activo para evitar inconsistencias en el catalogo.</p>
          </CardContent>
        </Card>
      </div>

      {filteredColors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No se encontraron colores con los filtros actuales.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredColors.map((color) => {
            const visibleProducts = color.products.slice(0, 4);
            const canDelete = color.productsCount === 0;

            return (
              <Card key={color.id} className="overflow-hidden border-[#ebe2d7] dark:border-border">
                <CardContent className="space-y-5 pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className="h-14 w-14 shrink-0 rounded-[1.25rem] border border-black/10 shadow-sm"
                        style={{ backgroundColor: color.colorValue }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {color.label}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                          {color.colorValue.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {color.isPredefined ? (
                        <Badge variant="secondary">Base</Badge>
                      ) : color.productsCount > 0 ? (
                        <Badge variant="outline">En catalogo</Badge>
                      ) : (
                        <Badge variant="outline">Biblioteca</Badge>
                      )}
                      {color.productsCount === 0 ? (
                        <Badge variant="outline">Sin uso</Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-[1.25rem] bg-muted/30 p-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        Productos
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {statValueFormatter(color.productsCount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        Variantes
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {statValueFormatter(color.variantCount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                        Principales
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {statValueFormatter(color.primaryProductsCount)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[1.25rem] border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Productos asociados
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {statValueFormatter(color.availableVariantCount)} disponibles
                      </span>
                    </div>

                    {visibleProducts.length > 0 ? (
                      <div className="space-y-2">
                        {visibleProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/admin/products/${product.id}/edit`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-muted/30 px-3 py-2 transition-colors hover:border-primary/20 hover:bg-primary/5"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-foreground">
                                {product.name}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {product.brand}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-1 text-[11px] font-medium",
                                product.status === "active" &&
                                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                                product.status === "draft" &&
                                  "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                                product.status === "archived" &&
                                  "bg-slate-200 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
                              )}
                            >
                              {STATUS_LABELS[product.status]}
                            </span>
                          </Link>
                        ))}
                        {color.products.length > visibleProducts.length ? (
                          <p className="text-xs text-muted-foreground">
                            +{color.products.length - visibleProducts.length} productos adicionales con este color.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Todavia no hay productos usando este color en el catalogo.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(color)}
                      disabled={isBusy}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(color)}
                      disabled={isBusy || !canDelete}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar
                    </Button>
                    {color.products[0] ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/${color.products[0].id}/edit`}>
                          Ver producto asociado
                        </Link>
                      </Button>
                    ) : null}
                    {!canDelete ? (
                      <p className="w-full text-xs text-muted-foreground">
                        Quita este color de los productos asociados antes de eliminarlo.
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={closeEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editorMode === "create" ? "Nuevo color" : "Editar color"}
            </DialogTitle>
            <DialogDescription>
              Define el nombre visible, el valor hexadecimal y si debe formar parte
              de la base visual principal de Peter Parts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="color-label" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="color-label"
                value={formValues.label}
                onChange={(event) => handleInputChange("label", event.target.value)}
                placeholder="Ejemplo: Rojo imperial"
                required
                disabled={isBusy}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="color-value" className="text-sm font-medium">
                Hexadecimal
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="color-picker"
                  type="color"
                  value={resolvePreviewColor(formValues.colorValue)}
                  onChange={(event) =>
                    handleInputChange("colorValue", event.target.value)
                  }
                  disabled={isBusy}
                  className="h-11 w-14 rounded-xl border border-input bg-background p-1"
                  aria-label="Seleccionar color"
                />
                <Input
                  id="color-value"
                  value={formValues.colorValue}
                  onChange={(event) =>
                    handleInputChange("colorValue", event.target.value)
                  }
                  placeholder="#c61c31"
                  required
                  disabled={isBusy}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usa formato hexadecimal de 3 o 6 digitos con prefijo #.
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
              <Checkbox
                id="color-base-toggle"
                checked={formValues.isBasePalette}
                onCheckedChange={(checked) =>
                  handleInputChange("isBasePalette", checked === true)
                }
                disabled={isBusy}
              />
              <div className="space-y-1">
                <label
                  htmlFor="color-base-toggle"
                  className="text-sm font-medium"
                >
                  Incluir en la base Peter Parts
                </label>
                <p className="text-xs text-muted-foreground">
                  Mantiene este color dentro de la paleta principal sugerida.
                </p>
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
                    {editorMode === "create"
                      ? "Guardando color..."
                      : "Actualizando color..."}
                  </>
                ) : editorMode === "create" ? (
                  "Crear color"
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar color</DialogTitle>
            <DialogDescription>
              Se eliminara este color de la biblioteca central. Esta accion solo
              esta disponible cuando el color ya no tiene productos asociados.
            </DialogDescription>
          </DialogHeader>

          {deleteTarget ? (
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
              <p>
                Vas a eliminar <span className="font-medium text-foreground">{deleteTarget.label}</span>.
              </p>
              <p className="mt-2">
                Productos asociados: {statValueFormatter(deleteTarget.productsCount)}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isBusy || (deleteTarget?.productsCount ?? 0) > 0}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando color...
                </>
              ) : (
                "Eliminar color"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}