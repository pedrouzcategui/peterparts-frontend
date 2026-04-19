import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { updateOrderStatusAsAdmin } from "@/lib/order-data";
import { ORDER_STATUS_OPTIONS, type OrderDisplayStatus } from "@/lib/orders";
import { requireAdminApiAccess } from "@/lib/auth/admin";

export const runtime = "nodejs";

interface UpdateOrderStatusBody {
  status?: unknown;
}

const VALID_STATUSES = new Set<OrderDisplayStatus>(
  ORDER_STATUS_OPTIONS.map((option) => option.value),
);

function getStatusMessage(status: OrderDisplayStatus, inventoryRestored: boolean) {
  if (status === "cancelled") {
    return inventoryRestored
      ? "Pedido cancelado y stock restaurado correctamente."
      : "Pedido cancelado correctamente.";
  }

  const option = ORDER_STATUS_OPTIONS.find((candidate) => candidate.value === status);
  return option
    ? `Pedido actualizado a ${option.label.toLowerCase()}.`
    : "Pedido actualizado correctamente.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const access = await requireAdminApiAccess("/admin/orders");

  if (!access.ok) {
    return access.response;
  }

  const { orderId } = await params;
  const body = (await request.json().catch(() => null)) as UpdateOrderStatusBody | null;
  const requestedStatus =
    typeof body?.status === "string" ? (body.status.trim().toLowerCase() as OrderDisplayStatus) : null;

  if (!requestedStatus || !VALID_STATUSES.has(requestedStatus)) {
    return NextResponse.json(
      { message: "Selecciona un estado valido para el pedido." },
      { status: 400 },
    );
  }

  try {
    const result = await updateOrderStatusAsAdmin(orderId, requestedStatus);

    revalidatePath("/admin/orders");
    revalidatePath("/admin/users");
    revalidatePath("/account");

    return NextResponse.json(
      {
        message: getStatusMessage(requestedStatus, result.inventoryRestored),
        order: result.order,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "No pudimos actualizar el pedido.";
    const status = message === "Pedido no encontrado." ? 404 : 400;

    return NextResponse.json({ message }, { status });
  }
}
