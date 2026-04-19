import "server-only";

import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

function buildLoginRedirectPath(redirectTo: string): string {
  const encodedRedirect = encodeURIComponent(redirectTo);
  return `/login?redirectTo=${encodedRedirect}`;
}

async function getAuthenticatedUser() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      name: true,
    },
  });
}

export async function requireAdminPageAccess(redirectTo = "/admin") {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(buildLoginRedirectPath(redirectTo));
  }

  if (user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return user;
}

export async function requireAdminActionAccess() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Debes iniciar sesion para continuar.");
  }

  if (user.role !== UserRole.ADMIN) {
    throw new Error("No tienes permisos para realizar esta accion.");
  }

  return user;
}

export async function requireAdminApiAccess(redirectTo = "/admin") {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          message: "Debes iniciar sesion para acceder a esta ruta.",
          redirectTo: buildLoginRedirectPath(redirectTo),
        },
        { status: 401 },
      ),
    };
  }

  if (user.role !== UserRole.ADMIN) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "No tienes permisos para acceder a esta ruta." },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    user,
  };
}