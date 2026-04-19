import "server-only";

import { cache } from "react";
import { auth } from "@/auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { ProductStatus } from "@/lib/generated/prisma/enums";
import {
  getActiveExchangeRateValue,
  mapProduct,
  productInclude,
} from "@/lib/product-data";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/lib/types";

export const FAVOURITES_PATH = "/favourites";

interface CurrentFavouriteUser {
  id: string;
  email: string;
  firstName: string | null;
  name: string | null;
}

export interface FavouriteProductItem {
  savedAt: Date;
  product: Product;
}

export interface ToggleFavoriteResult {
  status: "added" | "removed" | "error";
  productName?: string;
  message?: string;
}

export function buildLoginRedirectPath(redirectTo: string): string {
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

type FavouriteProductDelegate = {
  findMany: typeof prisma.favoriteProduct.findMany;
  findUnique: typeof prisma.favoriteProduct.findUnique;
  count: typeof prisma.favoriteProduct.count;
  create: typeof prisma.favoriteProduct.create;
  delete: typeof prisma.favoriteProduct.delete;
};

function getFavouriteProductDelegate(): FavouriteProductDelegate | null {
  const favouriteProduct = (
    prisma as typeof prisma & {
      favoriteProduct?: Partial<FavouriteProductDelegate>;
    }
  ).favoriteProduct;

  if (
    typeof favouriteProduct?.findMany !== "function" ||
    typeof favouriteProduct?.findUnique !== "function" ||
    typeof favouriteProduct?.count !== "function" ||
    typeof favouriteProduct?.create !== "function" ||
    typeof favouriteProduct?.delete !== "function"
  ) {
    return null;
  }

  return favouriteProduct as FavouriteProductDelegate;
}

function isFavouritePersistenceUnavailableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

export const getCurrentFavouriteUser = cache(
  async (): Promise<CurrentFavouriteUser | null> => {
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
        name: true,
      },
    });
  },
);

export async function getFavouriteProductIdsForUser(
  userId: string,
  productIds?: string[],
): Promise<Set<string>> {
  const favouriteProduct = getFavouriteProductDelegate();

  if (!favouriteProduct) {
    return new Set<string>();
  }

  try {
    const favourites = await favouriteProduct.findMany({
      where: {
        userId,
        ...(productIds && productIds.length > 0
          ? {
              productId: {
                in: productIds,
              },
            }
          : {}),
        product: {
          status: ProductStatus.ACTIVE,
        },
      },
      select: {
        productId: true,
      },
    });

    return new Set(favourites.map((favourite) => favourite.productId));
  } catch (error) {
    if (isFavouritePersistenceUnavailableError(error)) {
      return new Set<string>();
    }

    throw error;
  }
}

export async function getFavouriteProductsForUser(
  userId: string,
): Promise<FavouriteProductItem[]> {
  const favouriteProduct = getFavouriteProductDelegate();

  if (!favouriteProduct) {
    return [];
  }

  try {
    const [favourites, activeExchangeRate] = await Promise.all([
      favouriteProduct.findMany({
        where: {
          userId,
          product: {
            status: ProductStatus.ACTIVE,
          },
        },
        include: {
          product: {
            include: productInclude,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      getActiveExchangeRateValue(),
    ]);

    return favourites.map((favourite) => ({
      savedAt: favourite.createdAt,
      product: mapProduct(favourite.product, activeExchangeRate),
    }));
  } catch (error) {
    if (isFavouritePersistenceUnavailableError(error)) {
      return [];
    }

    throw error;
  }
}

export async function getFavouriteCountForUser(userId: string): Promise<number> {
  const favouriteProduct = getFavouriteProductDelegate();

  if (!favouriteProduct) {
    return 0;
  }

  try {
    return await favouriteProduct.count({
      where: {
        userId,
        product: {
          status: ProductStatus.ACTIVE,
        },
      },
    });
  } catch (error) {
    if (isFavouritePersistenceUnavailableError(error)) {
      return 0;
    }

    throw error;
  }
}

export async function toggleFavoriteForUser(
  userId: string,
  productId: string,
): Promise<ToggleFavoriteResult> {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });

  if (!product || product.status !== ProductStatus.ACTIVE) {
    return {
      status: "error",
      message: "No pudimos guardar este producto porque ya no esta disponible.",
    };
  }

  const favouriteProduct = getFavouriteProductDelegate();

  if (!favouriteProduct) {
    return {
      status: "error",
      message:
        "Los favoritos estaran disponibles despues de regenerar el cliente de Prisma.",
    };
  }

  try {
    const existingFavourite = await favouriteProduct.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: product.id,
        },
      },
      select: {
        userId: true,
      },
    });

    if (existingFavourite) {
      await favouriteProduct.delete({
        where: {
          userId_productId: {
            userId,
            productId: product.id,
          },
        },
      });

      return {
        status: "removed",
        productName: product.name,
      };
    }

    await favouriteProduct.create({
      data: {
        userId,
        productId: product.id,
      },
    });

    return {
      status: "added",
      productName: product.name,
    };
  } catch (error) {
    if (isFavouritePersistenceUnavailableError(error)) {
      return {
        status: "error",
        message:
          "Los favoritos estaran disponibles despues de aplicar la migracion pendiente.",
      };
    }

    throw error;
  }
}