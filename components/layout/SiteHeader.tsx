"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  Coffee,
  CookingPot,
  CreditCard,
  Palette,
  Search,
  Sparkles,
  Tag,
  Truck,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import CartButton from "@/components/cart/CartButton";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  {
    label: "Batidoras de pedestal",
    href: "/products?category=Batidoras de pedestal",
    icon: ChefHat,
  },
  {
    label: "Cafe y espresso",
    href: "/products?category=Cafeteras",
    icon: Coffee,
  },
  {
    label: "Encimera y cocina",
    href: "/products?category=Procesadores de alimentos",
    icon: CookingPot,
  },
  {
    label: "Ofertas",
    href: "/products?sale=sale",
    icon: Tag,
  },
  {
    label: "Colores",
    href: "/products?color=red",
    icon: Palette,
  },
  {
    label: "Comunidad",
    href: "/forum",
    icon: Sparkles,
  },
] as const;

const SERVICE_ITEMS = [
  {
    label: "Entrega estandar gratis | Sin costo de envio",
    icon: Truck,
  },
  {
    label: "Grabado disponible en productos seleccionados",
    icon: Sparkles,
  },
  {
    label: "Financiamiento al 0% APR disponible con Affirm",
    icon: CreditCard,
  },
] as const;

const DEFAULT_SCROLL_THRESHOLDS = {
  collapse: 40,
  expand: 8,
} as const;

const PRODUCTS_SCROLL_THRESHOLDS = {
  collapse: 260,
  expand: 96,
} as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [isCondensed, setIsCondensed] = useState(false);

  useEffect(() => {
    const scrollThresholds =
      pathname === "/products"
        ? PRODUCTS_SCROLL_THRESHOLDS
        : DEFAULT_SCROLL_THRESHOLDS;

    const handleScroll = () => {
      setIsCondensed((currentValue) => {
        const nextIsCondensed = currentValue
          ? window.scrollY > scrollThresholds.expand
          : window.scrollY > scrollThresholds.collapse;

        return currentValue === nextIsCondensed ? currentValue : nextIsCondensed;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e7e1d8] bg-white text-[#1A1714] shadow-[0_10px_30px_rgba(26,23,20,0.05)] dark:border-border dark:bg-background/95 dark:text-foreground dark:shadow-none dark:supports-backdrop-filter:bg-background/60">
      {/* Main navigation */}
      <div className="border-b border-primary/30 bg-primary text-primary-foreground dark:border-border dark:bg-background">
        <div className="site-shell grid h-24 grid-cols-[auto_1fr_auto] items-center gap-8">
          {/* Logo */}
          <BrandLogo
            priority
            variant="dark"
            sizes="(max-width: 640px) 8rem, 10rem"
            logoClassName="h-12 w-28 sm:h-14 sm:w-32"
          />

          {/* Nav links */}
          <nav className="hidden items-center justify-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex h-full min-w-36 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground transition-colors hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right icons */}
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Buscar"
              className="text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Cuenta"
              className="text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
            >
              <Link href="/login">
                <UserRound className="h-5 w-5" />
              </Link>
            </Button>

            <CartButton
              className="text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
              badgeClassName="bg-white text-primary dark:bg-primary dark:text-primary-foreground"
            />
            <ThemeToggle className="text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground" />
          </div>
        </div>
      </div>

      {/* Promo banner */}
      <div
        aria-hidden={isCondensed}
        className={`overflow-hidden bg-[#e8f1fb] transition-all duration-300 ease-out dark:bg-muted/30 ${
          isCondensed
            ? "pointer-events-none max-h-0 border-0 opacity-0"
            : "max-h-16 border-b border-[#dde7f3] opacity-100 dark:border-border"
        }`}
      >
        <div className="site-shell flex min-h-14 items-center justify-center text-center">
          <p className="text-sm font-medium text-[#17324d] dark:text-foreground">
            <span className="font-semibold">Evento de ahorro de primavera</span>
            <span className="mx-1.5 text-[#5a7188] dark:text-muted-foreground">|</span>
            25% de descuento en electrodomesticos de encimera seleccionados*
            <Link
              href="/products?sale=sale"
              className="ml-2 font-semibold uppercase tracking-[0.12em] underline underline-offset-4 hover:text-primary"
            >
              Comprar ahora
            </Link>
          </p>
        </div>
      </div>

      {/* Service strip */}
      <div
        aria-hidden={isCondensed}
        className={`overflow-hidden bg-[#f6f3ef] transition-all duration-300 ease-out dark:bg-muted/20 ${
          isCondensed ? "pointer-events-none max-h-0 opacity-0" : "max-h-20 opacity-100"
        }`}
      >
        <div className="site-shell hidden min-h-14 items-center justify-between gap-8 py-2 lg:flex">
          {SERVICE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-3 text-sm font-medium text-[#6a6358] dark:text-muted-foreground"
              >
                <Icon className="h-5 w-5 text-[#9a9184] dark:text-muted-foreground" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
