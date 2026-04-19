import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseCartItems } from "@/lib/cart";
import { createOrderWithReservedInventory } from "@/lib/order-data";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface CreateOrderBody {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
  address?: unknown;
  city?: unknown;
  state?: unknown;
  zip?: unknown;
  country?: unknown;
  notes?: unknown;
  items?: unknown;
}

function getStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const session = await auth();
  const normalizedSessionEmail = session?.user?.email?.trim().toLowerCase();
  const body = (await request.json().catch(() => null)) as CreateOrderBody | null;

  if (!body) {
    return NextResponse.json(
      { message: "No recibimos los datos del pedido." },
      { status: 400 },
    );
  }

  const email = getStringValue(body.email);
  const firstName = getStringValue(body.firstName);
  const lastName = getStringValue(body.lastName);
  const phone = getStringValue(body.phone);
  const address = getStringValue(body.address);
  const city = getStringValue(body.city);
  const state = getStringValue(body.state);
  const zip = getStringValue(body.zip);
  const country = getStringValue(body.country);
  const notes = getStringValue(body.notes);
  const items = parseCartItems(body.items);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { message: "Ingresa un correo electronico valido." },
      { status: 400 },
    );
  }

  if (!firstName || !lastName || !phone || !address || !city || !state || !zip || !country) {
    return NextResponse.json(
      {
        message:
          "Completa todos los datos de contacto y entrega para crear el pedido.",
      },
      { status: 400 },
    );
  }

  if (items.length === 0) {
    return NextResponse.json(
      { message: "Tu carrito esta vacio. Agrega productos antes de crear el pedido." },
      { status: 400 },
    );
  }

  try {
    const currentUser = normalizedSessionEmail
      ? await prisma.user.findUnique({
          where: {
            email: normalizedSessionEmail,
          },
          select: {
            id: true,
          },
        })
      : null;
    const order = await createOrderWithReservedInventory({
      userId: currentUser?.id ?? null,
      email,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zip,
      country,
      notes,
      items,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/users");
    revalidatePath("/account");

    return NextResponse.json(
      {
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "No pudimos guardar tu pedido en este momento. Intenta nuevamente.";
    const status =
      message === "Uno de los productos ya no esta disponible." ||
      message.startsWith("No hay inventario suficiente para")
        ? 409
        : 500;

    return NextResponse.json(
      { message },
      { status },
    );
  }
}