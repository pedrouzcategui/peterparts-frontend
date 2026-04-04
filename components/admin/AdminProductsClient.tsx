"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import AdminMarkdownEditor from "@/components/admin/AdminMarkdownEditor";
import AdminTagInput from "@/components/admin/AdminTagInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminExchangeRate, AdminProduct } from "@/lib/admin-data";
import { formatExchangeRate, formatUsd, formatVes, roundMoney } from "@/lib/currency";

type SortField = "name" | "brand" | "price" | "stock" | "status";
type SortDirection = "asc" | "desc";

type ProductStatus = "active" | "draft" | "archived";

interface ProductFormState {
  name: string;
  brand: string;
  categories: string[];
  priceUsd: string;
  priceVes: string;
  stock: string;
  status: ProductStatus;
  description: string;
}

interface SelectedImage {
  file: File;
  previewUrl: string;
}

const ADD_BRAND_VALUE = "__add_brand__";

function sortBrands(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right, "es"));
}

function createEmptyForm(defaultBrand: string): ProductFormState {
  return {
    name: "",
    brand: defaultBrand,
    categories: [],
    priceUsd: "",
    priceVes: "",
    stock: "0",
    status: "draft",
    description: "",
  };
}

interface AdminProductsClientProps {
  initialProducts: AdminProduct[];
  existingBrands: string[];
  existingCategories: string[];
  latestExchangeRate: AdminExchangeRate | null;
}

function getStatusBadge(status: AdminProduct["status"]) {
  const variants: Record<
    AdminProduct["status"],
    "default" | "secondary" | "outline"
  > = {
    active: "default",
    draft: "secondary",
    archived: "outline",
  };

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status === "active"
        ? "activo"
        : status === "draft"
          ? "borrador"
          : "archivado"}
    </Badge>
  );
}

export default function AdminProductsClient({
  initialProducts,
  existingBrands,
  existingCategories,
  latestExchangeRate,
}: AdminProductsClientProps) {
  const router = useRouter();
  const [brandOptions, setBrandOptions] = useState(() => sortBrands(existingBrands));
  const defaultBrand = brandOptions[0] ?? "";
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState<ProductFormState>(() =>
    createEmptyForm(defaultBrand),
  );
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasManualVesPrice, setHasManualVesPrice] = useState(false);
  const [isRefreshing, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  const filteredProducts = initialProducts
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * direction;
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }

      return 0;
    });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection("asc");
  };

  const handleEdit = (product: AdminProduct) => {
    toast.info(
      `La edicion avanzada de ${product.name} aun no esta lista. Usa este formulario para crear nuevos productos con descripcion e imagenes.`,
    );
  };

  const handleDelete = (productId: string) => {
    toast.info(`La eliminacion de ${productId} se habilitara en una siguiente iteracion.`);
  };

  const clearSelectedImages = () => {
    setSelectedImages((currentImages) => {
      currentImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });

      return [];
    });
  };

  const handleOpenCreateForm = () => {
    setFormValues(createEmptyForm(defaultBrand));
    setHasManualVesPrice(false);
    clearSelectedImages();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormValues(createEmptyForm(defaultBrand));
    setHasManualVesPrice(false);
    setIsBrandModalOpen(false);
    setNewBrandName("");
    clearSelectedImages();
  };

  const handleInputChange = <Key extends keyof ProductFormState>(
    key: Key,
    value: ProductFormState[Key],
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const applyCurrentExchangeRate = () => {
    if (!latestExchangeRate) {
      toast.info("No hay una tasa activa para calcular el precio en bolivares.");
      return;
    }

    const priceUsd = Number(formValues.priceUsd);

    if (!Number.isFinite(priceUsd) || priceUsd < 0) {
      toast.error("Ingresa primero un precio USD valido.");
      return;
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      priceVes: roundMoney(priceUsd * latestExchangeRate.rate).toFixed(2),
    }));
    setHasManualVesPrice(false);
  };

  const handleUsdPriceChange = (value: string) => {
    setFormValues((currentValues) => {
      if (
        hasManualVesPrice ||
        !latestExchangeRate ||
        value.trim() === ""
      ) {
        return {
          ...currentValues,
          priceUsd: value,
        };
      }

      const parsedPrice = Number(value);

      return {
        ...currentValues,
        priceUsd: value,
        priceVes:
          Number.isFinite(parsedPrice) && parsedPrice >= 0
            ? roundMoney(parsedPrice * latestExchangeRate.rate).toFixed(2)
            : "",
      };
    });
  };

  const handleVesPriceChange = (value: string) => {
    setHasManualVesPrice(true);
    handleInputChange("priceVes", value);
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    clearSelectedImages();

    setSelectedImages(
      files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    );
  };

  const handleBrandSelect = (value: string) => {
    if (value === ADD_BRAND_VALUE) {
      setIsBrandModalOpen(true);
      return;
    }

    handleInputChange("brand", value);
  };

  const handleCreateBrand = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedBrand = newBrandName.trim();

    if (!trimmedBrand) {
      toast.error("Ingresa un nombre de marca.");
      return;
    }

    const existingBrand = brandOptions.find(
      (brand) => brand.toLowerCase() === trimmedBrand.toLowerCase(),
    );

    if (existingBrand) {
      handleInputChange("brand", existingBrand);
      setIsBrandModalOpen(false);
      setNewBrandName("");
      toast.info("La marca ya existia y fue seleccionada.");
      return;
    }

    try {
      setIsCreatingBrand(true);

      const response = await fetch("/api/admin/brands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedBrand }),
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string; brand?: { name: string } }
        | null;

      if (!response.ok || !result?.brand?.name) {
        throw new Error(result?.message ?? "No se pudo crear la marca.");
      }

      const createdBrandName = result.brand.name;

      setBrandOptions((currentBrands) =>
        sortBrands([...currentBrands, createdBrandName]),
      );
      handleInputChange("brand", createdBrandName);
      setIsBrandModalOpen(false);
      setNewBrandName("");
      toast.success("Marca creada correctamente.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear la marca.",
      );
    } finally {
      setIsCreatingBrand(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedImages.length === 0) {
      toast.error("Debes subir al menos una imagen del producto.");
      return;
    }

    const payload = new FormData();

    payload.append("name", formValues.name);
    payload.append("brand", formValues.brand);
    payload.append("categories", JSON.stringify(formValues.categories));
    payload.append("priceUsd", formValues.priceUsd);
    payload.append("priceVes", formValues.priceVes);
    payload.append("stock", formValues.stock);
    payload.append("status", formValues.status);
    payload.append("description", formValues.description);

    selectedImages.forEach((image) => {
      payload.append("images", image.file);
    });

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.message ?? "No se pudo guardar el producto.",
        );
      }

      toast.success("Producto creado correctamente.");
      handleCloseForm();
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {latestExchangeRate
              ? `Tasa activa: 1 USD = ${formatExchangeRate(latestExchangeRate.rate)} VES${latestExchangeRate.source ? ` · Fuente: ${latestExchangeRate.source}` : ""}`
              : "No hay una tasa USD/VES activa. Puedes registrar una luego con POST /api/admin/exchange-rates."}
          </p>
        </div>
        <Button onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4" />
          Agregar producto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar producto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nombre del producto
                  </label>
                  <Input
                    id="name"
                    value={formValues.name}
                    onChange={(event) => handleInputChange("name", event.target.value)}
                    placeholder="Ingresa el nombre del producto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    Marca
                  </label>
                  <Select
                    value={formValues.brand || undefined}
                    onValueChange={handleBrandSelect}
                  >
                    <SelectTrigger id="brand" className="w-full" aria-label="Marca">
                      <SelectValue placeholder="Selecciona una marca" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {brandOptions.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                      <SelectItem value={ADD_BRAND_VALUE}>+ Agregar marca...</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Selecciona una marca existente o agrega una nueva desde el modal.
                  </p>
                </div>
                <div className="md:col-span-2">
                  <AdminTagInput
                    id="categories"
                    label="Categoria"
                    values={formValues.categories}
                    suggestions={existingCategories}
                    placeholder="Escribe una categoria y usa coma para agregarla"
                    helperText="La primera categoria se usara como categoria principal del producto. Las demas se guardaran como badges adicionales."
                    required
                    onChange={(values) => handleInputChange("categories", values)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price-usd" className="text-sm font-medium">
                    Precio USD
                  </label>
                  <Input
                    id="price-usd"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.priceUsd}
                    onChange={(event) => handleUsdPriceChange(event.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="price-ves" className="text-sm font-medium">
                      Precio VES
                    </label>
                    {latestExchangeRate ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 text-xs"
                        onClick={applyCurrentExchangeRate}
                      >
                        Usar tasa actual
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    id="price-ves"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.priceVes}
                    onChange={(event) => handleVesPriceChange(event.target.value)}
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {latestExchangeRate
                      ? `Referencia actual: 1 USD = ${formatExchangeRate(latestExchangeRate.rate)} VES.`
                      : "Ingresa el precio en bolivares manualmente o registra una tasa activa para autocalcularlo."}
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium">
                    Inventario
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formValues.stock}
                    onChange={(event) => handleInputChange("stock", event.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Estado
                  </label>
                  <select
                    id="status"
                    value={formValues.status}
                    onChange={(event) =>
                      handleInputChange("status", event.target.value as ProductStatus)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descripcion
                  </label>
                  <AdminMarkdownEditor
                    value={formValues.description}
                    onChange={(value) => handleInputChange("description", value)}
                    placeholder="Escribe la descripcion en markdown. Puedes usar titulos, listas, enlaces, negritas y mas."
                  />
                  <p className="text-xs text-muted-foreground">
                    La descripcion se guarda en markdown para que tambien pueda renderizarse en la tienda.
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="images" className="text-sm font-medium">
                    Imagenes del producto
                  </label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    onChange={handleImagesChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Las imagenes se guardaran en public/products/uploads y se asociaran automaticamente al producto.
                  </p>
                  {selectedImages.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {selectedImages.map((image) => (
                        <div
                          key={`${image.file.name}-${image.file.lastModified}`}
                          className="overflow-hidden rounded-xl border border-border bg-card"
                        >
                          <div
                            className="aspect-square bg-cover bg-center"
                            style={{ backgroundImage: `url(${image.previewUrl})` }}
                          />
                          <div className="space-y-1 p-3">
                            <p className="truncate text-sm font-medium text-foreground">
                              {image.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(image.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || isRefreshing}>
                  {isSubmitting ? "Guardando producto..." : "Crear producto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                  disabled={isSubmitting || isRefreshing}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar marca</DialogTitle>
            <DialogDescription>
              Crea una nueva marca sin salir del formulario del producto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBrand} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="new-brand-name" className="text-sm font-medium">
                Nombre de la marca
              </label>
              <Input
                id="new-brand-name"
                value={newBrandName}
                onChange={(event) => setNewBrandName(event.target.value)}
                placeholder="Ejemplo: Breville"
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsBrandModalOpen(false);
                  setNewBrandName("");
                }}
                disabled={isCreatingBrand}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingBrand}>
                {isCreatingBrand ? "Guardando marca..." : "Guardar marca"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <select
                value={sortField}
                onChange={(event) =>
                  handleSort(event.target.value as SortField)
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="name">Nombre</option>
                <option value="brand">Marca</option>
                <option value="price">Precio</option>
                <option value="stock">Inventario</option>
                <option value="status">Estado</option>
              </select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
                }
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Precio USD</TableHead>
                <TableHead>Precio VES</TableHead>
                <TableHead>Inventario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(product.categories ?? [product.category]).map((category) => (
                        <Badge key={`${product.id}-${category}`} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{formatUsd(product.priceUsd ?? product.price)}</TableCell>
                  <TableCell>
                    {typeof product.priceVes === "number" && product.priceVes > 0
                      ? formatVes(product.priceVes)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        product.stock === 0
                          ? "text-red-500"
                          : product.stock < 20
                            ? "text-yellow-500"
                            : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(product)}
                        aria-label="Editar producto"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(product.id)}
                        aria-label="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mas opciones"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron productos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
