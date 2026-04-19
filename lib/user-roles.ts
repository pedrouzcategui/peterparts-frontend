import { UserRole } from "@/lib/generated/prisma/enums";

type RoleBadgeVariant = "default" | "secondary" | "outline";

interface UserRolePresentation {
  label: string;
  badgeVariant: RoleBadgeVariant;
  badgeClassName: string;
}

const USER_ROLE_PRESENTATIONS: Record<UserRole, UserRolePresentation> = {
  [UserRole.GUEST]: {
    label: "Guest",
    badgeVariant: "secondary",
    badgeClassName:
      "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  },
  [UserRole.CUSTOMER]: {
    label: "Customer",
    badgeVariant: "default",
    badgeClassName:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  [UserRole.ADMIN]: {
    label: "Admin",
    badgeVariant: "outline",
    badgeClassName:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

export const USER_ROLE_OPTIONS = [
  UserRole.GUEST,
  UserRole.CUSTOMER,
  UserRole.ADMIN,
] as const;

export function getUserRolePresentation(role: UserRole): UserRolePresentation {
  return USER_ROLE_PRESENTATIONS[role];
}

export function getUserRoleLabel(role: UserRole): string {
  return getUserRolePresentation(role).label;
}