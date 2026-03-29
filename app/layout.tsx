import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/providers/CartProvider";
import { SonnerToaster } from "@/components/providers/SonnerToaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
