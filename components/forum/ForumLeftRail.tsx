import Link from "next/link";
import {
  Clock3,
  Flame,
  House,
  PackageSearch,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ForumSort } from "@/lib/forum-data";

interface ForumLeftRailProps {
  activeSort: ForumSort;
  activeTag: string | null;
}

const navigationLinks = [
  {
    href: "/forum",
    label: "Principal",
    icon: House,
    isActive: (activeSort: ForumSort, activeTag: string | null) =>
      activeSort === "hot" && activeTag === null,
  },
  {
    href: "/forum?sort=new",
    label: "Nuevos",
    icon: Clock3,
    isActive: (activeSort: ForumSort) => activeSort === "new",
  },
  {
    href: "/forum?sort=top",
    label: "Top",
    icon: TrendingUp,
    isActive: (activeSort: ForumSort) => activeSort === "top",
  },
  {
    href: "/forum?tag=repuestos",
    label: "Repuestos",
    icon: PackageSearch,
    isActive: (_activeSort: ForumSort, activeTag: string | null) =>
      activeTag === "repuestos",
  },
  {
    href: "/forum?tag=reparacion",
    label: "Reparación",
    icon: Wrench,
    isActive: (_activeSort: ForumSort, activeTag: string | null) =>
      activeTag === "reparacion",
  },
  {
    href: "/forum?tag=kitchenaid",
    label: "KitchenAid",
    icon: Flame,
    isActive: (_activeSort: ForumSort, activeTag: string | null) =>
      activeTag === "kitchenaid",
  },
];

function navLinkClass(isActive: boolean) {
  return cn(
    "flex min-h-14 items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-semibold transition-all",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground hover:bg-muted"
  );
}

export default function ForumLeftRail({
  activeSort,
  activeTag,
}: ForumLeftRailProps) {
  return (
    <aside className="space-y-5">
      <div className="rounded-[28px] border border-border/70 bg-card p-4 shadow-sm">
        <p className="px-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Navegación
        </p>

        <nav className="space-y-2">
          {navigationLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive(activeSort, activeTag);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(isActive)}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-colors",
                    isActive
                      ? "bg-white/14 text-primary-foreground"
                      : "bg-muted text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-[28px] border border-border/70 bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-foreground">
              Centro de ayuda PeterParts
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Usa el foro para validar fallas, compatibilidad y numeros de pieza antes de comprar.
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ver repuestos y batidoras
        </Link>
      </div>
    </aside>
  );
}