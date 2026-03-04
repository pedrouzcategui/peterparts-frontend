import { type ReactNode } from "react";
import Link from "next/link";

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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-white font-semibold text-lg">PeterParts</span>
          </Link>
        </div>

        {/* Decorative content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/80 p-8">
            <h2 className="text-3xl font-bold mb-4">Welcome to PeterParts</h2>
            <p className="text-white/60 max-w-md">
              Your one-stop shop for premium kitchen appliances and parts
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
