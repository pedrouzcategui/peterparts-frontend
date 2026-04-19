import "server-only";

import { cache } from "react";
import { OrderStatus, UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orderCount: number;
  deliveredOrderCount: number;
  createdAt: string;
}

export interface AdminUsersStats {
  total: number;
  guests: number;
  customers: number;
  admins: number;
}

export interface AdminUsersOverview {
  users: AdminUserSummary[];
  stats: AdminUsersStats;
}

const USER_ROLE_SORT_ORDER: Record<UserRole, number> = {
  [UserRole.ADMIN]: 0,
  [UserRole.CUSTOMER]: 1,
  [UserRole.GUEST]: 2,
};

function buildAdminUserName(user: {
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}) {
  const displayName = user.name?.trim();

  if (displayName) {
    return displayName;
  }

  const composedName = [user.firstName, user.lastName]
    .filter((value) => Boolean(value?.trim()))
    .join(" ")
    .trim();

  return composedName || user.email;
}

export const getAdminUsersOverview = cache(
  async (): Promise<AdminUsersOverview> => {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            status: true,
          },
        },
      },
    });

    const mappedUsers = users
      .map((user) => {
        const deliveredOrderCount = user.orders.reduce((count, order) => {
          return order.status === OrderStatus.DELIVERED ? count + 1 : count;
        }, 0);

        return {
          id: user.id,
          name: buildAdminUserName(user),
          email: user.email,
          role: user.role,
          orderCount: user.orders.length,
          deliveredOrderCount,
          createdAt: user.createdAt.toISOString(),
        };
      })
      .toSorted((left, right) => {
        const roleDifference =
          USER_ROLE_SORT_ORDER[left.role] - USER_ROLE_SORT_ORDER[right.role];

        if (roleDifference !== 0) {
          return roleDifference;
        }

        return right.createdAt.localeCompare(left.createdAt);
      });

    const stats = mappedUsers.reduce<AdminUsersStats>(
      (currentStats, user) => {
        currentStats.total += 1;

        if (user.role === UserRole.ADMIN) {
          currentStats.admins += 1;
        } else if (user.role === UserRole.CUSTOMER) {
          currentStats.customers += 1;
        } else {
          currentStats.guests += 1;
        }

        return currentStats;
      },
      {
        total: 0,
        guests: 0,
        customers: 0,
        admins: 0,
      },
    );

    return {
      users: mappedUsers,
      stats,
    };
  },
);