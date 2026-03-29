"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mb-2"
          onClick={() => router.push("/login")}
          aria-label="Volver al inicio de sesion"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        {/* Success state */}
        <div className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Revisa tu correo</h1>
          <p className="text-muted-foreground">
            Te enviamos un enlace para restablecer la contrasena a{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="space-y-4">
          <Button
            type="button"
            className="w-full h-11"
            onClick={() => router.push("/login")}
          >
            Volver a iniciar sesion
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿No recibiste el correo?{" "}
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Haz clic para reenviarlo
            </button>
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold tracking-tight">¿Olvidaste tu contrasena?</h1>
        <p className="text-muted-foreground">
          No te preocupes, te enviaremos instrucciones para restablecerla.
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Restablecer contrasena"}
        </Button>
      </form>

      {/* Back to login link */}
      <p className="text-center text-sm text-muted-foreground">
        ¿Recordaste tu contrasena?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
        >
          Volver a iniciar sesion
        </Link>
      </p>
    </div>
  );
}
