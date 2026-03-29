"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Percent,
  Puzzle,
  HelpCircle,
  Settings,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/users", label: "Clientes", icon: Users },
  { href: "/admin/reports", label: "Reportes", icon: FileText },
  { href: "/admin/discounts", label: "Descuentos", icon: Percent },
];

const secondaryNavItems = [
  { href: "/admin/integrations", label: "Integraciones", icon: Puzzle },
  { href: "/admin/help", label: "Ayuda", icon: HelpCircle },
  { href: "/admin/settings", label: "Configuracion", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <BrandLogo logoClassName="h-9 w-38" />
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-red-500 text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t px-3 py-4">
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-red-500 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
