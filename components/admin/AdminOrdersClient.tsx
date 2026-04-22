"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusPresentation,
  ORDER_STATUS_OPTIONS,
  type OrderDisplayStatus,
} from "@/lib/orders";

interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderDisplayStatus;
  itemCount: number;
  total: number;
  createdAt: string;
  inventoryReserved: boolean;
  canUpdateStatus: boolean;
}

interface AdminOrdersStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

interface AdminOrdersClientProps {
  initialOrders: AdminOrderSummary[];
  initialStats: AdminOrdersStats;
}

function StatusBadge({ status }: { status: OrderDisplayStatus }) {
  const presentation = getOrderStatusPresentation(status);

  return (
    <Badge
      variant={presentation.variant}
      className={`capitalize ${presentation.className}`}
    >
      {presentation.label}
    </Badge>
  );
}

export default function AdminOrdersClient({
  initialOrders,
  initialStats,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderDisplayStatus | "all">("all");
  const [pendingStatuses, setPendingStatuses] = useState<
    Record<string, OrderDisplayStatus>
  >({});
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredOrders = initialOrders.filter((order) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch =
      normalizedQuery.length === 0 ||
      order.orderNumber.toLowerCase().includes(normalizedQuery) ||
      order.customerName.toLowerCase().includes(normalizedQuery) ||
      order.customerEmail.toLowerCase().includes(normalizedQuery);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function handleStatusSelection(orderId: string, status: OrderDisplayStatus) {
    setPendingStatuses((current) => ({
      ...current,
      [orderId]: status,
    }));
  }

  function handleSave(order: AdminOrderSummary) {
    const nextStatus = pendingStatuses[order.id] ?? order.status;

    if (nextStatus === order.status) {
      return;
    }

    setActiveOrderId(order.id);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/admin/orders/${order.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: nextStatus }),
          });
          const responseBody = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          if (!response.ok) {
            toast.error(
              responseBody?.message ?? "No pudimos actualizar el pedido.",
            );
            return;
          }

          toast.success(
            responseBody?.message ?? "Pedido actualizado correctamente.",
          );
          router.refresh();
        } catch {
          toast.error("No pudimos actualizar el pedido.");
        } finally {
          setActiveOrderId(null);
        }
      })();
    });
  }

  function handleDelete(order: AdminOrderSummary) {
    if (order.status !== "cancelled") {
      return;
    }

    const confirmed = window.confirm(
      `Eliminar el pedido ${order.orderNumber}? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveOrderId(order.id);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`/api/admin/orders/${order.id}`, {
            method: "DELETE",
          });
          const responseBody = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          if (!response.ok) {
            toast.error(responseBody?.message ?? "No pudimos eliminar el pedido.");
            return;
          }

          toast.success(
            responseBody?.message ?? "Pedido eliminado correctamente.",
          );
          router.refresh();
        } catch {
          toast.error("No pudimos eliminar el pedido.");
        } finally {
          setActiveOrderId(null);
        }
      })();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pedidos totales</p>
            <p className="text-2xl font-bold">{initialStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{initialStats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">En proceso</p>
            <p className="text-2xl font-bold text-blue-600">{initialStats.processing}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Enviados</p>
            <p className="text-2xl font-bold text-purple-600">{initialStats.shipped}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Entregados</p>
            <p className="text-2xl font-bold text-green-600">{initialStats.delivered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <p className="text-2xl font-bold text-red-600">
              {formatOrderCurrency(initialStats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-50 max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar pedidos..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as OrderDisplayStatus | "all",
                  )
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos</option>
                {ORDER_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Articulos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Coordinacion</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const selectedStatus = pendingStatuses[order.id] ?? order.status;
                const isSaving = isPending && activeOrderId === order.id;
                const canDelete = order.status === "cancelled";

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <StatusBadge status={order.status} />
                        <p className="text-xs text-muted-foreground">
                          {order.inventoryReserved ? "Stock reservado" : "Stock liberado"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{order.itemCount}</TableCell>
                    <TableCell className="font-medium">
                      {formatOrderCurrency(order.total)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.status === "cancelled" ? "Cancelado" : "WhatsApp"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.canUpdateStatus ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={selectedStatus}
                            onChange={(event) =>
                              handleStatusSelection(
                                order.id,
                                event.target.value as OrderDisplayStatus,
                              )
                            }
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            disabled={isSaving}
                          >
                            {ORDER_STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <Button
                            type="button"
                            variant={selectedStatus === "cancelled" ? "destructive" : "outline"}
                            size="sm"
                            onClick={() => handleSave(order)}
                            disabled={isSaving || selectedStatus === order.status}
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Guardar
                          </Button>
                        </div>
                      ) : canDelete ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(order)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Eliminar
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Cerrado</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No se encontraron pedidos.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
