import { NextResponse } from "next/server";
import {
  buildForumLoginRedirectPath,
  castForumVote,
  getCurrentForumUser,
} from "@/lib/forum";

export const runtime = "nodejs";

interface VoteRequestBody {
  entityType?: string;
  entityId?: string;
  direction?: string;
}

function getRedirectTarget(request: Request): string {
  const referer = request.headers.get("referer");

  if (!referer) {
    return "/forum";
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}` || "/forum";
  } catch {
    return "/forum";
  }
}

function isValidEntityType(value: string | undefined): value is "thread" | "reply" {
  return value === "thread" || value === "reply";
}

function isValidDirection(value: string | undefined): value is "up" | "down" {
  return value === "up" || value === "down";
}

export async function POST(request: Request) {
  const currentUser = await getCurrentForumUser();

  if (!currentUser) {
    return NextResponse.json(
      {
        message: "Debes iniciar sesion para votar.",
        redirectTo: buildForumLoginRedirectPath(getRedirectTarget(request)),
      },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as VoteRequestBody | null;

  if (!body || !isValidEntityType(body.entityType) || !body.entityId || !isValidDirection(body.direction)) {
    return NextResponse.json(
      {
        message: "La solicitud de voto no es valida.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await castForumVote({
      userId: currentUser.id,
      entityType: body.entityType,
      entityId: body.entityId,
      direction: body.direction,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No pudimos registrar tu voto.",
      },
      { status: 400 },
    );
  }
}