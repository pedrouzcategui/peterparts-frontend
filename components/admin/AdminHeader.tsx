"use client";

import { Bell, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AdminHeaderProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    name: string | null;
    email: string;
  };
}

function getAdminDisplayName(user: AdminHeaderProps["user"]): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  const normalizedName = user.name?.trim();

  if (normalizedName) {
    return normalizedName;
  }

  return user.email;
}

function getAdminInitials(displayName: string): string {
  const parts = displayName
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return "AD";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const displayName = getAdminDisplayName(user);
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
        <Button variant="ghost" size="icon" aria-label="Mensajes">
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>
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
