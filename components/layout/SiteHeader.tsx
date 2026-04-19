import Link from "next/link";
import { Heart, PackageSearch, Search, Sparkles, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { getFavouriteCountForUser } from "@/lib/favourites";
import { prisma } from "@/lib/prisma";
import CartButton from "@/components/cart/CartButton";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  {
    label: "Productos",
    href: "/products",
    icon: PackageSearch,
  },
  {
    label: "Foro",
    href: "/forum",
    icon: Sparkles,
  },
] as const;

function getFirstName(name: string | null | undefined): string | null {
  const normalizedName = name?.trim();

  if (!normalizedName) {
    return null;
  }

  const [firstName] = normalizedName.split(/\s+/);
  return firstName || null;
}

function getFirstNameFromEmail(email: string | null | undefined): string | null {
  const localPart = email?.split("@")[0]?.trim();

  if (!localPart) {
    return null;
  }

  const cleanedLocalPart = localPart.replace(/[._-]+/g, " ").replace(/\d+/g, " ").trim();

  if (!cleanedLocalPart) {
    return null;
  }

  const [firstToken] = cleanedLocalPart.split(/\s+/);

  if (!firstToken) {
    return null;
  }

  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}

export default async function SiteHeader() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const sessionFirstName = getFirstName(session?.user?.name);
  const currentUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          firstName: true,
          name: true,
        },
      })
    : null;
  const firstName =
    currentUser?.firstName?.trim() ||
    getFirstName(currentUser?.name) ||
    sessionFirstName ||
    getFirstNameFromEmail(email);
  const isSignedIn = Boolean(session?.user);
  const accountHref = isSignedIn ? "/account" : "/login";
  const favouritesHref = isSignedIn
    ? "/favourites"
    : "/login?redirectTo=%2Ffavourites";
  const favouriteCount = currentUser?.id
    ? await getFavouriteCountForUser(currentUser.id)
    : 0;

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
            {isSignedIn ? (
              <Link
                href={accountHref}
                className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold tracking-[0.06em] text-white transition-colors hover:bg-white/20 sm:flex dark:border-border dark:bg-accent/40 dark:text-foreground dark:hover:bg-accent/60"
              >
                <UserRound className="h-4 w-4" />
                <span>{firstName ? `Hola, ${firstName}` : "Mi cuenta"}</span>
              </Link>
            ) : null}

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
              aria-label={isSignedIn ? (firstName ? `Sesion iniciada como ${firstName}` : "Sesion iniciada") : "Cuenta"}
              className="text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
            >
              <Link href={accountHref}>
                <UserRound className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label={isSignedIn ? `Favoritos (${favouriteCount})` : "Favoritos"}
              className="relative text-primary-foreground hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-accent/50 dark:hover:text-accent-foreground"
            >
              <Link href={favouritesHref}>
                <Heart className="h-5 w-5" />
                {favouriteCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold text-primary dark:bg-primary dark:text-primary-foreground">
                    {favouriteCount > 9 ? "9+" : favouriteCount}
                  </span>
                ) : null}
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
    </header>
  );
}
