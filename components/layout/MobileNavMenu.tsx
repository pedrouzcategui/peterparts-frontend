"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Menu,
  PackageSearch,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MOBILE_NAV_LINKS = [
  {
    label: "Productos",
    href: "/products",
    description: "Explora repuestos, engranajes y equipos seleccionados.",
    icon: PackageSearch,
  },
  {
    label: "Foro",
    href: "/forum",
    description: "Consulta fallas, comparte experiencias y encuentra ayuda.",
    icon: Sparkles,
  },
] as const;

const MOBILE_QUICK_LINKS = [
  {
    key: "account",
    label: "Mi cuenta",
    description: "Pedidos, datos de acceso y actividad.",
    icon: UserRound,
  },
  {
    key: "favourites",
    label: "Favoritos",
    description: "Tus productos guardados para revisar luego.",
    icon: Heart,
  },
  {
    key: "cart",
    label: "Carrito",
    description: "Revisa lo que vas a comprar.",
    href: "/cart",
    icon: ShoppingBag,
  },
] as const;

interface MobileNavMenuProps {
  accountHref: string;
  favouritesHref: string;
  favouriteCount: number;
  firstName: string | null;
  isSignedIn: boolean;
}

export default function MobileNavMenu({
  accountHref,
  favouritesHref,
  favouriteCount,
  firstName,
  isSignedIn,
}: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menu"
          className="lg:hidden text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full overflow-y-auto border-l-0 p-0 text-[#1A1714] sm:max-w-sm dark:border-l dark:text-foreground"
      >
        <div className="relative min-h-full overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(217,30,54,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(141,19,33,0.12),transparent_34%),linear-gradient(180deg,#f7f0e7_0%,#f2e8dc_100%)] dark:bg-[linear-gradient(180deg,#16110f_0%,#221715_100%)]">
          <div className="absolute inset-x-6 top-40 h-56 rounded-full bg-primary/8 blur-3xl dark:bg-primary/15" />

          <div className="relative bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_38%),linear-gradient(155deg,#d91e36_0%,#8d1321_100%)] px-5 pb-7 pt-7 text-white">
            <div className="absolute -left-10 top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-6 top-6 z-10">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar menu</span>
              </button>
            </div>

            <SheetHeader className="relative p-0 pr-14 text-left">
              <SheetTitle className="font-heading text-[1.9rem] leading-none text-white">
                {isSignedIn && firstName ? `Hola, ${firstName}` : "Menu Peter Parts"}
              </SheetTitle>
              <SheetDescription className="mt-3 max-w-[18rem] text-sm leading-6 text-white/80">
                Accede rapido al catalogo, al foro y a tu actividad desde el telefono.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="relative space-y-5 px-4 py-5">
            <section className="rounded-[2rem] border border-white/60 bg-white/88 p-3 shadow-[0_18px_50px_rgba(26,23,20,0.08)] backdrop-blur-sm dark:border-border/70 dark:bg-[#221917]/85">
              <div className="space-y-3">
                {MOBILE_NAV_LINKS.map((link) => {
                  const Icon = link.icon;

                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-start gap-3 rounded-[1.5rem] border border-[#eaded7] bg-white px-4 py-4 shadow-sm transition-colors hover:border-primary/20 hover:bg-[#fff7f7] dark:border-border dark:bg-muted/20 dark:hover:bg-muted/35"
                      >
                        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {link.label}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                            {link.description}
                          </span>
                        </span>
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/55 bg-[#fff7f1]/88 p-4 shadow-[0_14px_38px_rgba(26,23,20,0.06)] backdrop-blur-sm dark:border-border/70 dark:bg-[#251a17]/82">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Accesos rapidos
              </p>

              <div className="space-y-2.5">
                {MOBILE_QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  const href =
                    link.key === "account"
                      ? accountHref
                      : link.key === "favourites"
                        ? favouritesHref
                        : link.href;
                  const badge =
                    link.key === "favourites" && favouriteCount > 0
                      ? favouriteCount > 9
                        ? "9+"
                        : String(favouriteCount)
                      : null;

                  return (
                    <SheetClose asChild key={link.key}>
                      <Link
                        href={href}
                        className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-transparent bg-white/80 px-4 py-3 transition-colors hover:border-primary/15 hover:bg-white dark:bg-muted/20 dark:hover:bg-muted/35"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground dark:bg-muted/80">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground">
                              {link.label}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {link.description}
                            </span>
                          </span>
                        </span>
                        {badge ? (
                          <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                            {badge}
                          </span>
                        ) : null}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}