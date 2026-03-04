import Link from "next/link";
import { Search, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { label: "Cuisinart", href: "/products?brand=Cuisinart" },
  { label: "Whirlpool", href: "/products?brand=Whirlpool" },
  { label: "KitchenAid", href: "/products?brand=KitchenAid" },
] as const;

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top utility bar */}
      <div className="flex h-9 items-center justify-end gap-4 border-b px-6 text-xs text-muted-foreground">
        <Link href="#" className="hover:text-foreground transition-colors">
          Find a Store
        </Link>
        <span className="text-border">|</span>
        <Link href="#" className="hover:text-foreground transition-colors">
          Help
        </Link>
        <span className="text-border">|</span>
        <Link href="#" className="hover:text-foreground transition-colors">
          Join Us
        </Link>
        <span className="text-border">|</span>
        <Link href="#" className="hover:text-foreground transition-colors">
          Sign In
        </Link>
      </div>

      {/* Main navigation */}
      <div className="flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">PeterParts</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium hover:text-muted-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/products"
            className="text-sm font-medium hover:text-muted-foreground transition-colors"
          >
            All Products
          </Link>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Shopping bag">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Promo banner */}
      <div className="flex h-9 items-center justify-center bg-muted text-xs font-medium">
        <button className="mr-4" aria-label="Previous promotion">&lsaquo;</button>
        <Link href="/products" className="underline underline-offset-2 hover:text-primary">
          Shop New Arrivals
        </Link>
        <button className="ml-4" aria-label="Next promotion">&rsaquo;</button>
      </div>
    </header>
  );
}
