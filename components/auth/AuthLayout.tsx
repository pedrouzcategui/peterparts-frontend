import { type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Image */}
      <div className="relative hidden lg:block overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-black via-gray-800 to-black">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-red-600/30 via-red-500/10 to-transparent" />
        </div>

        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <BrandLogo
            href="/"
            priority
            variant="dark"
            className="rounded-xl bg-white/5 px-3 py-2 backdrop-blur-sm"
            logoClassName="h-12 w-45"
          />
        </div>

        {/* Decorative content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/80 p-8">
            <h2 className="text-3xl font-bold mb-4">Bienvenido a PeterParts</h2>
            <p className="text-white/60 max-w-md">
              Tu tienda especializada en electrodomesticos y repuestos de cocina premium
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
