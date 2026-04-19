export type OrderDisplayStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderBadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface OrderStatusPresentation {
  label: string;
  variant: OrderBadgeVariant;
  className: string;
}

export const ORDER_STATUS_OPTIONS: Array<{
  value: OrderDisplayStatus;
  label: string;
}> = [
  { value: "pending", label: "Pendiente" },
  { value: "processing", label: "En proceso" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

const ORDER_STATUS_PRESENTATIONS: Record<
  OrderDisplayStatus,
  OrderStatusPresentation
> = {
  pending: {
    label: "Pendiente",
    variant: "secondary",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  processing: {
    label: "En proceso",
    variant: "secondary",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  shipped: {
    label: "Enviado",
    variant: "secondary",
    className:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  delivered: {
    label: "Entregado",
    variant: "default",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  },
  cancelled: {
    label: "Cancelado",
    variant: "destructive",
    className: "",
  },
};

export function getOrderStatusPresentation(status: OrderDisplayStatus) {
  return ORDER_STATUS_PRESENTATIONS[status];
}

export function isClosedOrderStatus(status: OrderDisplayStatus): boolean {
  return status === "delivered" || status === "cancelled";
}

export function formatOrderCurrency(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatOrderDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
  }).format(date);
}
