import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
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
    default: "PeterParts — Kitchen Appliances & Gear",
    template: "%s | PeterParts",
  },
  description:
    "Shop premium kitchen appliances from Cuisinart, Whirlpool, and KitchenAid at PeterParts.",
  metadataBase: new URL("https://peterparts.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SiteHeader />
          <main className="min-h-[calc(100vh-14rem)]">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
