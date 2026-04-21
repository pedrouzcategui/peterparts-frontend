import { Search } from "lucide-react";
import { AdminModerationMenu } from "@/components/admin/AdminModerationMenu";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import type { AdminForumHeaderModerationSummary } from "@/lib/forum";

interface AdminHeaderProps {
  currentUser: {
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
  };
  moderationSummary: AdminForumHeaderModerationSummary;
}

function getAdminDisplayName(user: AdminHeaderProps["currentUser"]): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  if (user.name?.trim()) {
    return user.name.trim();
  }

  return user.email.split("@")[0] ?? user.email;
}

function getAdminInitials(displayName: string): string {
  const tokens = displayName.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return "PP";
  }

  return tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join("");
}

export function AdminHeader({
  currentUser,
  moderationSummary,
}: AdminHeaderProps) {
  const displayName = getAdminDisplayName(currentUser);
  const initials = getAdminInitials(displayName);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar inventario, pedidos, etc."
          className="pl-10"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <AdminModerationMenu moderationSummary={moderationSummary} />
        <ThemeToggle />

        {/* User */}
        <div className="ml-2 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-sm font-medium text-red-600">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{displayName}</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
