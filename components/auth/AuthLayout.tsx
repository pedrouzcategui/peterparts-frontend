import { type ReactNode } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(155deg,#630E19_0%,#8f1424_28%,#d91e36_68%,#4f0c16_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.1),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(26,23,20,0.32),transparent_42%)]" />

        <div className="relative flex h-full flex-col items-center justify-center px-12 py-16 text-center text-white">
          <div className="flex justify-center">
            <BrandLogo
              href="/"
              priority
              variant="dark"
              className="justify-center"
              logoClassName="h-24 w-64"
              sizes="16rem"
            />
          </div>

          <div className="mt-12 max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/72">
              Especialistas en KitchenAid
            </p>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Bienvenido a PeterParts
            </h2>
            <p className="mx-auto max-w-lg text-lg leading-8 text-white/80">
              Repuestos, engranajes y soporte confiable para mantener tus equipos funcionando con precision.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
