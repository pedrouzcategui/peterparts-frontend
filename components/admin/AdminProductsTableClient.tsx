"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  archiveAdminProductAction,
  hardDeleteAdminProductsAction,
} from "@/app/admin/products/actions";
import ProductImageWithFallback from "@/components/products/ProductImageWithFallback";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminExchangeRate, AdminProduct } from "@/lib/admin-data";
import { formatExchangeRate, formatUsd, formatVes } from "@/lib/currency";

type SortField = "name" | "brand" | "price" | "stock" | "status";
type SortDirection = "asc" | "desc";

type ProductActionTarget =
  | {
      kind: "single-archive";
      productId: string;
      productName: string;
    }
  | {
      kind: "bulk-delete";
      productIds: string[];
      count: number;
    }
  | null;

interface AdminProductsTableClientProps {
  initialProducts: AdminProduct[];
  latestExchangeRate: AdminExchangeRate | null;
}

function areSetsEqual(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}

function markProductsAsArchived(
  products: AdminProduct[],
  productIds: Set<string>,
): AdminProduct[] {
  let hasChanges = false;

  const nextProducts = products.map((product) => {
    if (!productIds.has(product.id) || product.status === "archived") {
      return product;
    }

    hasChanges = true;

    return {
      ...product,
      status: "archived" as const,
    };
  });

  return hasChanges ? nextProducts : products;
}

function removeProducts(
  products: AdminProduct[],
  productIds: Set<string>,
): AdminProduct[] {
  const nextProducts = products.filter((product) => !productIds.has(product.id));

  return nextProducts.length === products.length ? products : nextProducts;
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

export default function AdminProductsTableClient({
  initialProducts,
  latestExchangeRate,
}: AdminProductsTableClientProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [productActionTarget, setProductActionTarget] =
    useState<ProductActionTarget>(null);
  const [isMutatingProducts, startMutatingProducts] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase("es");

    return products
      .filter((product) => {
        if (!normalizedQuery) {
          return true;
        }

        return [product.name, product.brand, product.category]
          .join(" ")
          .toLocaleLowerCase("es")
          .includes(normalizedQuery);
      })
      .sort((leftProduct, rightProduct) => {
        const leftValue = leftProduct[sortField];
        const rightValue = rightProduct[sortField];
        const direction = sortDirection === "asc" ? 1 : -1;

        if (
          typeof leftValue === "string" &&
          typeof rightValue === "string"
        ) {
          return leftValue.localeCompare(rightValue, "es") * direction;
        }

        if (
          typeof leftValue === "number" &&
          typeof rightValue === "number"
        ) {
          return (leftValue - rightValue) * direction;
        }

        return 0;
      });
  }, [products, searchQuery, sortDirection, sortField]);

  const visibleProductIds = useMemo(
    () => filteredProducts.map((product) => product.id),
    [filteredProducts],
  );
  const visibleProductIdSet = useMemo(
    () => new Set(visibleProductIds),
    [visibleProductIds],
  );

  useEffect(() => {
    setSelectedProductIds((currentSelectedProductIds) => {
      const nextSelectedProductIds = new Set(
        [...currentSelectedProductIds].filter((productId) =>
          visibleProductIdSet.has(productId),
        ),
      );

      return areSetsEqual(currentSelectedProductIds, nextSelectedProductIds)
        ? currentSelectedProductIds
        : nextSelectedProductIds;
    });
  }, [visibleProductIdSet]);

  const selectedVisibleCount = selectedProductIds.size;
  const hasVisibleProducts = visibleProductIds.length > 0;
  const allVisibleProductsSelected =
    hasVisibleProducts && selectedVisibleCount === visibleProductIds.length;
  const selectAllCheckedState: boolean | "indeterminate" =
    allVisibleProductsSelected
      ? true
      : selectedVisibleCount > 0
        ? "indeterminate"
        : false;

  const toggleProductSelection = (productId: string, checked: boolean) => {
    setSelectedProductIds((currentSelectedProductIds) => {
      const nextSelectedProductIds = new Set(currentSelectedProductIds);

      if (checked) {
        nextSelectedProductIds.add(productId);
      } else {
        nextSelectedProductIds.delete(productId);
      }

      return areSetsEqual(currentSelectedProductIds, nextSelectedProductIds)
        ? currentSelectedProductIds
        : nextSelectedProductIds;
    });
  };

  const toggleAllVisibleProducts = (checked: boolean) => {
    setSelectedProductIds(() => {
      if (!checked) {
        return new Set();
      }

      return new Set(visibleProductIds);
    });
  };

  const clearSelection = () => {
    setSelectedProductIds(new Set());
  };

  const openSingleArchiveDialog = (product: AdminProduct) => {
    setProductActionTarget({
      kind: "single-archive",
      productId: product.id,
      productName: product.name,
    });
  };

  const openBulkDeleteDialog = () => {
    if (selectedVisibleCount === 0) {
      return;
    }

    setProductActionTarget({
      kind: "bulk-delete",
      productIds: visibleProductIds.filter((productId) =>
        selectedProductIds.has(productId),
      ),
      count: selectedVisibleCount,
    });
  };

  const handleProductActionConfirm = () => {
    if (!productActionTarget) {
      return;
    }

    const currentTarget = productActionTarget;

    startMutatingProducts(async () => {
      try {
        const result =
          currentTarget.kind === "single-archive"
            ? await archiveAdminProductAction(currentTarget.productId)
            : await hardDeleteAdminProductsAction(currentTarget.productIds);

        if (!result.ok) {
          toast.error(result.message);
          return;
        }

        const affectedProductIds = new Set(
          currentTarget.kind === "single-archive"
            ? [currentTarget.productId]
            : currentTarget.productIds,
        );

        setProducts((currentProducts) => {
          return currentTarget.kind === "single-archive"
            ? markProductsAsArchived(currentProducts, affectedProductIds)
            : removeProducts(currentProducts, affectedProductIds);
        });
        setSelectedProductIds((currentSelectedProductIds) => {
          const nextSelectedProductIds = new Set(currentSelectedProductIds);

          for (const productId of affectedProductIds) {
            nextSelectedProductIds.delete(productId);
          }

          return areSetsEqual(currentSelectedProductIds, nextSelectedProductIds)
            ? currentSelectedProductIds
            : nextSelectedProductIds;
        });
        setProductActionTarget(null);
        toast.success(result.message);
        router.refresh();
      } catch {
        toast.error(
          currentTarget.kind === "single-archive"
            ? "No pudimos archivar el producto."
            : "No pudimos eliminar definitivamente los productos seleccionados.",
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {latestExchangeRate
              ? `Tasa activa: 1 USD = ${formatExchangeRate(latestExchangeRate.rate)} VES${latestExchangeRate.source ? ` · Fuente: ${latestExchangeRate.source}` : ""}`
              : "No hay una tasa USD/VES activa. Registra una para autocalcular precios en bolivares."}
          </p>
          <div className="mt-2">
            <Button asChild variant="link" className="h-auto px-0 text-sm">
              <Link href="/admin/exchange-rates">Gestionar exchange rates</Link>
            </Button>
          </div>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Agregar producto
          </Link>
        </Button>
      </div>

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
                disabled={isMutatingProducts}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Ordenar por:
              </span>
              <select
                value={sortField}
                onChange={(event) =>
                  setSortField(event.target.value as SortField)
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={isMutatingProducts}
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
                disabled={isMutatingProducts}
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedVisibleCount > 0 ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {selectedVisibleCount === 1
                  ? "1 producto seleccionado"
                  : `${selectedVisibleCount} productos seleccionados`}
              </p>
              <p className="text-sm text-muted-foreground">
                La seleccion solo incluye los productos visibles en la tabla actual.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelection}
                disabled={isMutatingProducts}
              >
                Limpiar seleccion
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                disabled={isMutatingProducts}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar seleccionados
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectAllCheckedState}
                    onCheckedChange={(checked) =>
                      toggleAllVisibleProducts(checked === true)
                    }
                    aria-label="Seleccionar todos los productos visibles"
                    disabled={!hasVisibleProducts || isMutatingProducts}
                  />
                </TableHead>
                <TableHead style={{ width: 132 }}>Imagen del producto</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Precio USD</TableHead>
                <TableHead>Precio VES</TableHead>
                <TableHead>Inventario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow
                  key={product.id}
                  data-state={selectedProductIds.has(product.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedProductIds.has(product.id)}
                      onCheckedChange={(checked) =>
                        toggleProductSelection(product.id, checked === true)
                      }
                      aria-label={`Seleccionar ${product.name}`}
                      disabled={isMutatingProducts}
                    />
                  </TableCell>
                  <TableCell>
                    <div
                      className="relative overflow-hidden rounded-xl border border-border/70 bg-muted/30"
                      style={{ width: 100, height: 100 }}
                    >
                      <ProductImageWithFallback
                        src={product.imageUrl ?? undefined}
                        alt={`Vista previa de ${product.name}`}
                        sizes="100px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(product.categories ?? [product.category]).map(
                        (category) => (
                          <Badge
                            key={`${product.id}-${category}`}
                            variant="secondary"
                          >
                            {category}
                          </Badge>
                        ),
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatUsd(product.priceUsd ?? product.price)}
                  </TableCell>
                  <TableCell>
                    {typeof product.priceVes === "number" &&
                    product.priceVes > 0
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
                  <TableCell>
                    {typeof product.featuredRank === "number" ? (
                      <Badge variant="secondary">#{product.featuredRank}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          aria-label="Editar producto"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openSingleArchiveDialog(product)}
                        aria-label="Archivar producto"
                        disabled={isMutatingProducts}
                      >
                        <Archive className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Mas opciones"
                        disabled={isMutatingProducts}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron productos
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(productActionTarget)}
        onOpenChange={(open) => {
          if (!open && !isMutatingProducts) {
            setProductActionTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {productActionTarget?.kind === "single-archive"
                ? "Archivar producto"
                : "Eliminar productos seleccionados"}
            </DialogTitle>
            <DialogDescription>
              {productActionTarget?.kind === "single-archive"
                ? `Vas a archivar ${productActionTarget.productName}. El producto dejara de estar activo en el catalogo.`
                : productActionTarget
                  ? `Vas a eliminar definitivamente ${productActionTarget.count} productos visibles en esta tabla. Esta accion no se puede deshacer.`
                  : ""}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setProductActionTarget(null)}
              disabled={isMutatingProducts}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleProductActionConfirm}
              disabled={isMutatingProducts}
            >
              {isMutatingProducts ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : productActionTarget?.kind === "single-archive" ? (
                <Archive className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isMutatingProducts
                ? productActionTarget?.kind === "single-archive"
                  ? "Archivando..."
                  : "Eliminando..."
                : productActionTarget?.kind === "single-archive"
                  ? "Archivar producto"
                  : "Eliminar definitivamente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
