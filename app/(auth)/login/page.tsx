"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import { SocialButtons } from "@/components/auth/SocialButtons";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to dashboard
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-2"
        onClick={() => router.back()}
        aria-label="Volver"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/signup"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Registrate
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Correo electronico"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contrasena</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              ¿Olvidaste tu contrasena?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Contrasena"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isLoading}
          />
          <label
            htmlFor="remember"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Recordarme
          </label>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      {/* Social buttons */}
      <SocialButtons isLoading={isLoading} />
    </div>
  );
}
