import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const FOOTER_LINKS = [
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "#" },
      { label: "Order Status", href: "#" },
      { label: "Returns & Exchanges", href: "#" },
      { label: "Shipping Info", href: "#" },
    ],
  },
  {
    title: "About PeterParts",
    links: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Sustainability", href: "#" },
    ],
  },
  {
    title: "Our Brands",
    links: [
      { label: "Cuisinart", href: "/products?brand=Cuisinart" },
      { label: "Whirlpool", href: "/products?brand=Whirlpool" },
      { label: "KitchenAid", href: "/products?brand=KitchenAid" },
    ],
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              PeterParts
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Your trusted source for premium kitchen appliances from Cuisinart,
              Whirlpool, and KitchenAid.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PeterParts. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
