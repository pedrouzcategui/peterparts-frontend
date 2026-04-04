import type { Metadata } from "next";
import "@fontsource/lato/300.css";
import "@fontsource/lato/400.css";
import "@fontsource/lato/700.css";
import "@fontsource/lato/900.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/600.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/800.css";
import "leaflet/dist/leaflet.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { CartProvider } from "@/components/providers/CartProvider";
import { SonnerToaster } from "@/components/providers/SonnerToaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PeterParts — Electrodomesticos y accesorios de cocina",
    template: "%s | PeterParts",
  },
  description:
    "Compra electrodomesticos de cocina premium de Cuisinart, Whirlpool y KitchenAid en PeterParts.",
  metadataBase: new URL("https://peterparts.com"),
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/images/icon.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/images/icon-dark.png",
      },
    ],
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <CartProvider>
            {children}
            <SonnerToaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
