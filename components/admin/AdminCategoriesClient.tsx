"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminManagedCategory } from "@/lib/admin-data";

interface CategoryFormState {
  name: string;
  slug: string;
  description: string;
}

interface AdminCategoriesClientProps {
  initialCategories: AdminManagedCategory[];
}

function createEmptyForm(): CategoryFormState {
  return {
    name: "",
    slug: "",
    description: "",
  };
}

function createFormFromCategory(
  category: AdminManagedCategory,
): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
  };
}

function sortCategories(values: AdminManagedCategory[]): AdminManagedCategory[] {
  return [...values].sort((left, right) => left.name.localeCompare(right.name, "es"));
}

function textareaClassName() {
  return "flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-6";
}

const dateFormatter = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
});

export default function AdminCategoriesClient({
  initialCategories,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState(() =>
    sortCategories(initialCategories),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormState>(
    createEmptyForm,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminManagedCategory | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  const filteredCategories = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    if (!normalizedQuery) {
      return categories;
    }

    return categories.filter((category) => {
      const haystack = [
        category.name,
        category.slug,
        category.description,
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return haystack.includes(normalizedQuery);
    });
  }, [categories, searchQuery]);

  const isBusy = isSaving || isDeleting || isRefreshing;

  const handleInputChange = <Key extends keyof CategoryFormState>(
    key: Key,
    value: CategoryFormState[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const openCreateDialog = () => {
    setEditorMode("create");
    setEditingCategoryId(null);
    setFormValues(createEmptyForm());
    setIsEditorOpen(true);
  };

  const openEditDialog = (category: AdminManagedCategory) => {
    setEditorMode("edit");
    setEditingCategoryId(category.id);
    setFormValues(createFormFromCategory(category));
    setIsEditorOpen(true);
  };

  const closeEditor = (open: boolean) => {
    setIsEditorOpen(open);

    if (!open) {
      setEditingCategoryId(null);
      setFormValues(createEmptyForm());
    }
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);

      const endpoint =
        editorMode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${editingCategoryId ?? ""}`;
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
        category?: AdminManagedCategory;
      } | null;

      if (!response.ok || !result?.category) {
        throw new Error(result?.message ?? "No se pudo guardar la categoria.");
      }

      setCategories((currentCategories) => {
        if (editorMode === "create") {
          return sortCategories([...currentCategories, result.category]);
        }

        return sortCategories(
          currentCategories.map((category) =>
            category.id === result.category?.id ? result.category : category,
          ),
        );
      });

      toast.success(
        editorMode === "create"
          ? "Categoria creada correctamente."
          : "Categoria actualizada correctamente.",
      );
      closeEditor(false);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo guardar la categoria.",
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

      const response = await fetch(`/api/admin/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(result?.message ?? "No se pudo eliminar la categoria.");
      }

      setCategories((currentCategories) =>
        currentCategories.filter((category) => category.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
      toast.success("Categoria eliminada correctamente.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo eliminar la categoria.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Administra las categorias principales de productos, sus slugs y su
            descripcion corta para el catalogo.
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={isBusy}>
          <Plus className="h-4 w-4" />
          Nueva categoria
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, slug o descripcion..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Actualizada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">/{category.slug}</TableCell>
                  <TableCell>
                    {category.description ? (
                      <p className="max-w-lg text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin descripcion</span>
                    )}
                  </TableCell>
                  <TableCell>{category.productsCount}</TableCell>
                  <TableCell>{dateFormatter.format(new Date(category.updatedAt))}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEditDialog(category)}
                        aria-label={`Editar ${category.name}`}
                        disabled={isBusy}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleteTarget(category)}
                        aria-label={`Eliminar ${category.name}`}
                        disabled={isBusy || category.productsCount > 0}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron categorias.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={isEditorOpen} onOpenChange={closeEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editorMode === "create" ? "Nueva categoria" : "Editar categoria"}
            </DialogTitle>
            <DialogDescription>
              Define el nombre publico, el slug y una descripcion corta para la
              categoria principal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="category-name" className="text-sm font-medium">
                Nombre
              </label>
              <Input
                id="category-name"
                value={formValues.name}
                onChange={(event) => handleInputChange("name", event.target.value)}
                placeholder="Ejemplo: Batidoras de pedestal"
                required
                disabled={isBusy}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category-slug" className="text-sm font-medium">
                Slug
              </label>
              <Input
                id="category-slug"
                value={formValues.slug}
                onChange={(event) => handleInputChange("slug", event.target.value)}
                placeholder="batidoras-de-pedestal"
                disabled={isBusy}
              />
              <p className="text-xs text-muted-foreground">
                Si lo dejas vacio, se genera automaticamente a partir del nombre.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="category-description" className="text-sm font-medium">
                Descripcion
              </label>
              <textarea
                id="category-description"
                className={textareaClassName()}
                value={formValues.description}
                onChange={(event) =>
                  handleInputChange("description", event.target.value)
                }
                placeholder="Describe brevemente que productos agrupa esta categoria."
                disabled={isBusy}
              />
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
                {isSaving
                  ? editorMode === "create"
                    ? "Guardando categoria..."
                    : "Actualizando categoria..."
                  : editorMode === "create"
                    ? "Crear categoria"
                    : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar categoria</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Vas a eliminar ${deleteTarget.name}. Esta accion no se puede deshacer.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {deleteTarget?.productsCount ? (
            <p className="text-sm text-muted-foreground">
              Esta categoria no puede eliminarse mientras tenga productos asignados.
            </p>
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
              disabled={isBusy || Boolean(deleteTarget?.productsCount)}
            >
              {isDeleting ? "Eliminando..." : "Eliminar categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}