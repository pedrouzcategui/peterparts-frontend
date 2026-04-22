import type { Metadata } from "next";
import { auth } from "@/auth";
import CheckoutPageClient, {
  type CheckoutFormDefaults,
} from "@/components/cart/CheckoutPageClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Revisa tus productos, crea tu pedido y continúa la coordinación por WhatsApp.",
};

function splitDisplayName(name: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const normalized = name?.trim().replace(/\s+/g, " ") ?? "";

  if (!normalized) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const [firstName = "", ...rest] = normalized.split(" ");

  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export default async function CheckoutPage() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase() ?? "";

  let initialFormDefaults: CheckoutFormDefaults | undefined;

  if (email) {
    const fallbackNameParts = splitDisplayName(session?.user?.name);
    const currentUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        name: true,
      },
    });
    const latestOrder = await prisma.order.findFirst({
      where: {
        OR: [
          currentUser?.id ? { userId: currentUser.id } : undefined,
          { customerEmail: email },
        ].filter((value): value is { userId: string } | { customerEmail: string } =>
          Boolean(value),
        ),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        customerPhone: true,
        shippingAddress: true,
        shippingCity: true,
        shippingState: true,
        shippingPostalCode: true,
        shippingCountry: true,
      },
    });
    const derivedNameParts = splitDisplayName(currentUser?.name);

    initialFormDefaults = {
      email,
      firstName:
        currentUser?.firstName?.trim() ||
        derivedNameParts.firstName ||
        fallbackNameParts.firstName,
      lastName:
        currentUser?.lastName?.trim() ||
        derivedNameParts.lastName ||
        fallbackNameParts.lastName,
      phone: latestOrder?.customerPhone ?? "",
      address: latestOrder?.shippingAddress ?? "",
      city: latestOrder?.shippingCity ?? "",
      state: latestOrder?.shippingState ?? "",
      zip: latestOrder?.shippingPostalCode ?? "",
      country: latestOrder?.shippingCountry ?? "Venezuela",
    };
  }

  return <CheckoutPageClient initialFormDefaults={initialFormDefaults} />;
}