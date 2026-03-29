"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProduct } from "@/lib/admin-data";

type SortField = "name" | "brand" | "price" | "stock" | "status";
type SortDirection = "asc" | "desc";

interface AdminProductsClientProps {
  initialProducts: AdminProduct[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(value);
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
}: AdminProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );

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
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId: string) => {
    console.log("Delete product:", productId);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Agregar producto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? "Editar producto" : "Agregar producto"}
            </CardTitle>
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
                    defaultValue={editingProduct?.name ?? ""}
                    placeholder="Ingresa el nombre del producto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    Marca
                  </label>
                  <select
                    id="brand"
                    defaultValue={editingProduct?.brand ?? "Cuisinart"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Cuisinart">Cuisinart</option>
                    <option value="Whirlpool">Whirlpool</option>
                    <option value="KitchenAid">KitchenAid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Categoria
                  </label>
                  <Input
                    id="category"
                    defaultValue={editingProduct?.category ?? ""}
                    placeholder="Ingresa la categoria"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Precio
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price ?? ""}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="stock" className="text-sm font-medium">
                    Inventario
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    defaultValue={editingProduct?.stock ?? ""}
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
                    defaultValue={editingProduct?.status ?? "draft"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Activo</option>
                    <option value="draft">Borrador</option>
                    <option value="archived">Archivado</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingProduct ? "Actualizar producto" : "Crear producto"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
                <TableHead>Precio</TableHead>
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
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
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
