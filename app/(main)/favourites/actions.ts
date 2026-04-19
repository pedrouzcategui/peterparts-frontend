"use server";

import { revalidatePath } from "next/cache";
import {
  buildLoginRedirectPath,
  FAVOURITES_PATH,
  getCurrentFavouriteUser,
  toggleFavoriteForUser,
} from "@/lib/favourites";

export type ToggleFavouriteActionResult =
  | {
      status: "added" | "removed";
      productName: string;
    }
  | {
      status: "unauthenticated";
      redirectTo: string;
    }
  | {
      status: "error";
      message: string;
    };

interface ToggleFavouriteActionInput {
  productId: string;
  redirectPath: string;
}

export async function toggleFavouriteAction(
  input: ToggleFavouriteActionInput,
): Promise<ToggleFavouriteActionResult> {
  const currentUser = await getCurrentFavouriteUser();

  if (!currentUser) {
    return {
      status: "unauthenticated",
      redirectTo: buildLoginRedirectPath(input.redirectPath),
    };
  }

  const result = await toggleFavoriteForUser(currentUser.id, input.productId);

  if (result.status === "error") {
    return {
      status: "error",
      message: result.message ?? "No pudimos actualizar tus favoritos.",
    };
  }

  revalidatePath(input.redirectPath);
  revalidatePath(FAVOURITES_PATH);
  revalidatePath("/account");

  return {
    status: result.status,
    productName: result.productName ?? "Producto",
  };
}
