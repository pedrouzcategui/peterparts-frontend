import "server-only";

import { randomUUID } from "node:crypto";
import { getCartSummary, type CartItem } from "@/lib/cart";
import { buildOrderWhatsAppUrl } from "@/lib/contact";
import { OrderStatus, UserRole } from "@/lib/generated/prisma/enums";
import {
  type OrderDisplayStatus,
  isClosedOrderStatus,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";

interface CreateOrderInput {
  userId?: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notes: string;
  items: CartItem[];
}

interface OrderNumberLookupClient {
  order: {
    findUnique(args: {
      where: { orderNumber: string };
      select: { id: true };
    }): Promise<{ id: string } | null>;
  };
}

interface UserRoleSyncClient {
  user: {
    findUnique(args: object): Promise<{
      id: string;
      email: string;
      role: UserRole;
    } | null>;
    update(args: object): Promise<unknown>;
  };
  order: {
    count(args: object): Promise<number>;
    updateMany(args: object): Promise<unknown>;
  };
}

interface CustomerOrderItemSummary {
  id: string;
  name: string;
  slug: string;
  quantity: number;
  variantLabel: string | null;
  imageSrc: string;
  imageAlt: string;
  unitPrice: number;
  totalPrice: number;
}

export interface CustomerOrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: OrderDisplayStatus;
  itemCount: number;
  total: number;
  createdAt: string;
  whatsappUrl: string;
  items: CustomerOrderItemSummary[];
}

export interface AdminOrderSummary {
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

export interface AdminOrdersStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

export interface AdminOrdersOverview {
  orders: AdminOrderSummary[];
  stats: AdminOrdersStats;
}

export interface OrderMutationResult {
  order: AdminOrderSummary;
  inventoryRestored: boolean;
}

export function normalizeOrderStatus(status: OrderStatus): OrderDisplayStatus {
  switch (status) {
    case OrderStatus.CONTACT_PENDING:
    case OrderStatus.PENDING:
      return "pending";
    case OrderStatus.CONFIRMED:
    case OrderStatus.PROCESSING:
      return "processing";
    case OrderStatus.SHIPPED:
      return "shipped";
    case OrderStatus.DELIVERED:
      return "delivered";
    case OrderStatus.CANCELLED:
      return "cancelled";
    default:
      return "pending";
  }
}

function getStoredOrderStatus(status: OrderDisplayStatus): OrderStatus {
  switch (status) {
    case "pending":
      return OrderStatus.PENDING;
    case "processing":
      return OrderStatus.PROCESSING;
    case "shipped":
      return OrderStatus.SHIPPED;
    case "delivered":
      return OrderStatus.DELIVERED;
    case "cancelled":
      return OrderStatus.CANCELLED;
    default:
      return OrderStatus.PENDING;
  }
}

function buildCustomerName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function normalizeComparableEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildUserOrdersWhere(userId: string | null, email: string) {
  const normalizedEmail = normalizeComparableEmail(email);
  const emailFilter = {
    customerEmail: {
      equals: normalizedEmail,
      mode: "insensitive" as const,
    },
  };

  return userId
    ? {
        OR: [
          { userId },
          emailFilter,
        ],
      }
    : emailFilter;
}

function getRequestedProductQuantities(items: CartItem[]): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  return quantities;
}

function resolveCartItemProducts(
  items: CartItem[],
  products: Array<{ id: string; sku: string; name: string }>,
): {
  normalizedItems: CartItem[];
  quantitiesByDatabaseId: Map<string, number>;
  productNamesByDatabaseId: Map<string, string>;
} {
  const requestedIdentifiers = new Set(items.map((item) => item.productId));
  const productsByIdentifier = new Map<string, { id: string; name: string }>();

  for (const product of products) {
    if (requestedIdentifiers.has(product.id)) {
      productsByIdentifier.set(product.id, {
        id: product.id,
        name: product.name,
      });
    }

    if (requestedIdentifiers.has(product.sku)) {
      productsByIdentifier.set(product.sku, {
        id: product.id,
        name: product.name,
      });
    }
  }

  if (productsByIdentifier.size !== requestedIdentifiers.size) {
    throw new Error("Uno de los productos ya no esta disponible.");
  }

  const quantitiesByDatabaseId = new Map<string, number>();
  const productNamesByDatabaseId = new Map<string, string>();

  const normalizedItems = items.map((item) => {
    const resolvedProduct = productsByIdentifier.get(item.productId);

    if (!resolvedProduct) {
      throw new Error("Uno de los productos ya no esta disponible.");
    }

    quantitiesByDatabaseId.set(
      resolvedProduct.id,
      (quantitiesByDatabaseId.get(resolvedProduct.id) ?? 0) + item.quantity,
    );
    productNamesByDatabaseId.set(resolvedProduct.id, resolvedProduct.name);

    return {
      ...item,
      productId: resolvedProduct.id,
    };
  });

  return {
    normalizedItems,
    quantitiesByDatabaseId,
    productNamesByDatabaseId,
  };
}

async function createUniqueOrderNumber(
  client: OrderNumberLookupClient,
): Promise<string> {
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `PP-${dateStamp}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const existingOrder = await client.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!existingOrder) {
      return candidate;
    }
  }

  throw new Error("No pudimos generar un numero de pedido unico.");
}

async function syncUserRoleFromOrderHistory(
  client: UserRoleSyncClient,
  input: {
    userId?: string | null;
    email?: string | null;
  },
) {
  const normalizedEmail = input.email ? normalizeComparableEmail(input.email) : "";

  const user = input.userId
    ? await client.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })
    : normalizedEmail
      ? await client.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            role: true,
          },
        })
      : null;

  if (!user || user.role === UserRole.ADMIN) {
    return user?.role ?? null;
  }

  const deliveredOrderCount = await client.order.count({
    where: {
      status: OrderStatus.DELIVERED,
      OR: [
        { userId: user.id },
        {
          customerEmail: {
            equals: user.email,
            mode: "insensitive",
          },
        },
      ],
    },
  });

  const nextRole = deliveredOrderCount > 0 ? UserRole.CUSTOMER : UserRole.GUEST;

  if (user.role !== nextRole) {
    await client.user.update({
      where: { id: user.id },
      data: {
        role: nextRole,
      },
    });
  }

  return nextRole;
}

function mapCustomerOrder(order: {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: OrderStatus;
  itemCount: number;
  total: { toString(): string };
  createdAt: Date;
  items: Array<{
    id: string;
    name: string;
    slug: string;
    quantity: number;
    variantLabel: string | null;
    imageSrc: string;
    imageAlt: string;
    unitPrice: { toString(): string };
    totalPrice: { toString(): string };
  }>;
}): CustomerOrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: buildCustomerName(
      order.customerFirstName,
      order.customerLastName,
    ),
    customerEmail: order.customerEmail,
    status: normalizeOrderStatus(order.status),
    itemCount: order.itemCount,
    total: Number(order.total.toString()),
    createdAt: order.createdAt.toISOString(),
    whatsappUrl: buildOrderWhatsAppUrl(order.orderNumber),
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      quantity: item.quantity,
      variantLabel: item.variantLabel,
      imageSrc: item.imageSrc,
      imageAlt: item.imageAlt,
      unitPrice: Number(item.unitPrice.toString()),
      totalPrice: Number(item.totalPrice.toString()),
    })),
  };
}

function mapAdminOrder(order: {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  status: OrderStatus;
  itemCount: number;
  total: { toString(): string };
  inventoryReserved: boolean;
  createdAt: Date;
}): AdminOrderSummary {
  const status = normalizeOrderStatus(order.status);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: buildCustomerName(
      order.customerFirstName,
      order.customerLastName,
    ),
    customerEmail: order.customerEmail,
    status,
    itemCount: order.itemCount,
    total: Number(order.total.toString()),
    createdAt: order.createdAt.toISOString(),
    inventoryReserved: order.inventoryReserved,
    canUpdateStatus: !isClosedOrderStatus(status),
  };
}

async function linkOrdersToUser(userId: string, email: string) {
  await prisma.order.updateMany({
    where: {
      userId: null,
      customerEmail: {
        equals: normalizeComparableEmail(email),
        mode: "insensitive",
      },
    },
    data: {
      userId,
    },
  });

  await syncUserRoleFromOrderHistory(prisma, {
    userId,
    email,
  });
}

export async function createOrderWithReservedInventory(
  input: CreateOrderInput,
) {
  const summary = getCartSummary(input.items);
  const requestedQuantities = getRequestedProductQuantities(input.items);

  return prisma.$transaction(async (transaction) => {
    const productIds = Array.from(requestedQuantities.keys());
    const products = await transaction.product.findMany({
      where: {
        OR: [
          {
            id: {
              in: productIds,
            },
          },
          {
            sku: {
              in: productIds,
            },
          },
        ],
      },
      select: {
        id: true,
        sku: true,
        name: true,
      },
    });
    const {
      normalizedItems,
      quantitiesByDatabaseId,
      productNamesByDatabaseId,
    } = resolveCartItemProducts(input.items, products);

    for (const [productId, quantity] of quantitiesByDatabaseId) {
      const updateResult = await transaction.product.updateMany({
        where: {
          id: productId,
          stockQuantity: {
            gte: quantity,
          },
        },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });

      if (updateResult.count !== 1) {
        const productName =
          productNamesByDatabaseId.get(productId) ?? "uno de los productos";
        throw new Error(`No hay inventario suficiente para ${productName}.`);
      }
    }

    const orderNumber = await createUniqueOrderNumber(transaction);
    const order = await transaction.order.create({
      data: {
        userId: input.userId ?? null,
        orderNumber,
        customerEmail: input.email,
        customerFirstName: input.firstName,
        customerLastName: input.lastName,
        customerPhone: input.phone,
        shippingAddress: input.address,
        shippingCity: input.city,
        shippingState: input.state,
        shippingPostalCode: input.zip,
        shippingCountry: input.country,
        notes: input.notes || null,
        status: OrderStatus.PENDING,
        inventoryReserved: true,
        itemCount: summary.itemCount,
        subtotal: summary.subtotal.toFixed(2),
        shippingAmount: summary.shipping.toFixed(2),
        taxAmount: summary.tax.toFixed(2),
        total: summary.total.toFixed(2),
        items: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            slug: item.slug,
            name: item.name,
            brand: item.brand,
            subcategory: item.subcategory,
            imageSrc: item.image.src,
            imageAlt: item.image.alt,
            variantLabel: item.variantLabel ?? null,
            unitPrice: item.price.toFixed(2),
            quantity: item.quantity,
            totalPrice: (item.price * item.quantity).toFixed(2),
          })),
        },
      },
      select: {
        orderNumber: true,
        itemCount: true,
        total: true,
      },
    });

    return {
      orderNumber: order.orderNumber,
      itemCount: order.itemCount,
      total: Number(order.total.toString()),
      whatsappUrl: buildOrderWhatsAppUrl(order.orderNumber),
    };
  });
}

export async function getCustomerOrders(
  userId: string | null,
  email: string,
): Promise<CustomerOrderSummary[]> {
  if (userId) {
    await linkOrdersToUser(userId, email);
  }

  const orders = await prisma.order.findMany({
    where: buildUserOrdersWhere(userId, email),
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      customerEmail: true,
      customerFirstName: true,
      customerLastName: true,
      status: true,
      itemCount: true,
      total: true,
      createdAt: true,
      items: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          quantity: true,
          variantLabel: true,
          imageSrc: true,
          imageAlt: true,
          unitPrice: true,
          totalPrice: true,
        },
      },
    },
  });

  return orders.map(mapCustomerOrder);
}

export async function getAdminOrdersOverview(): Promise<AdminOrdersOverview> {
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      customerEmail: true,
      customerFirstName: true,
      customerLastName: true,
      status: true,
      itemCount: true,
      total: true,
      inventoryReserved: true,
      createdAt: true,
    },
  });
  const mappedOrders = orders.map(mapAdminOrder);
  const stats: AdminOrdersStats = {
    total: mappedOrders.length,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  };

  for (const order of mappedOrders) {
    stats[order.status] += 1;

    if (order.status !== "cancelled") {
      stats.totalRevenue += order.total;
    }
  }

  return {
    orders: mappedOrders,
    stats,
  };
}

export async function updateOrderStatusAsAdmin(
  orderId: string,
  nextStatus: OrderDisplayStatus,
): Promise<OrderMutationResult> {
  return prisma.$transaction(async (transaction) => {
    const existingOrder = await transaction.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        customerEmail: true,
        customerFirstName: true,
        customerLastName: true,
        status: true,
        itemCount: true,
        total: true,
        inventoryReserved: true,
        createdAt: true,
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    if (!existingOrder) {
      throw new Error("Pedido no encontrado.");
    }

    const currentStatus = normalizeOrderStatus(existingOrder.status);

    if (isClosedOrderStatus(currentStatus) && currentStatus !== nextStatus) {
      throw new Error("Los pedidos cerrados no pueden modificarse.");
    }

    if (nextStatus === "cancelled") {
      if (currentStatus === "cancelled") {
        return {
          order: mapAdminOrder(existingOrder),
          inventoryRestored: false,
        };
      }

      if (currentStatus === "delivered") {
        throw new Error("Los pedidos entregados no pueden cancelarse.");
      }

      let inventoryRestored = false;

      if (existingOrder.inventoryReserved) {
        for (const item of existingOrder.items) {
          await transaction.product.updateMany({
            where: {
              id: item.productId,
            },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }

        inventoryRestored = true;
      }

      const updatedOrder = await transaction.order.update({
        where: {
          id: orderId,
        },
        data: {
          status: OrderStatus.CANCELLED,
          inventoryReserved: false,
        },
        select: {
          id: true,
          userId: true,
          orderNumber: true,
          customerEmail: true,
          customerFirstName: true,
          customerLastName: true,
          status: true,
          itemCount: true,
          total: true,
          inventoryReserved: true,
          createdAt: true,
        },
      });

      await syncUserRoleFromOrderHistory(transaction, {
        userId: updatedOrder.userId,
        email: updatedOrder.customerEmail,
      });

      return {
        order: mapAdminOrder(updatedOrder),
        inventoryRestored,
      };
    }

    const persistedNextStatus = getStoredOrderStatus(nextStatus);

    if (
      currentStatus === nextStatus &&
      existingOrder.status === persistedNextStatus
    ) {
      return {
        order: mapAdminOrder(existingOrder),
        inventoryRestored: false,
      };
    }

    const updatedOrder = await transaction.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: persistedNextStatus,
      },
      select: {
        id: true,
        userId: true,
        orderNumber: true,
        customerEmail: true,
        customerFirstName: true,
        customerLastName: true,
        status: true,
        itemCount: true,
        total: true,
        inventoryReserved: true,
        createdAt: true,
      },
    });

    await syncUserRoleFromOrderHistory(transaction, {
      userId: updatedOrder.userId,
      email: updatedOrder.customerEmail,
    });

    return {
      order: mapAdminOrder(updatedOrder),
      inventoryRestored: false,
    };
  });
}

export async function deleteCancelledOrderAsAdmin(orderId: string): Promise<void> {
  await prisma.$transaction(async (transaction) => {
    const existingOrder = await transaction.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        userId: true,
        customerEmail: true,
        status: true,
      },
    });

    if (!existingOrder) {
      throw new Error("Pedido no encontrado.");
    }

    if (normalizeOrderStatus(existingOrder.status) !== "cancelled") {
      throw new Error("Solo puedes eliminar pedidos cancelados.");
    }

    await transaction.order.delete({
      where: {
        id: orderId,
      },
    });

    await syncUserRoleFromOrderHistory(transaction, {
      userId: existingOrder.userId,
      email: existingOrder.customerEmail,
    });
  });
}
