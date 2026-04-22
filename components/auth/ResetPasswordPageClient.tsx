"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { initialAuthActionState } from "@/app/(auth)/action-state";
import {
  resetPasswordAction,
} from "@/app/(auth)/actions";
import { normalizeAuthActionState } from "@/components/auth/auth-action-state";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

interface ResetPasswordPageClientProps {
  token: string | null;
}

function FeedbackMessage({
  message,
  variant,
}: {
  message: string;
  variant: "error" | "success";
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {message}
    </p>
  );
}

export default function ResetPasswordPageClient({
  token,
}: ResetPasswordPageClientProps) {
  const router = useRouter();
  const [rawState, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialAuthActionState,
  );
  const state = normalizeAuthActionState(rawState);
  const hasFeedbackMessage = state.message.trim().length > 0;

  if (!token) {
    return (
      <div className="space-y-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mb-2"
          onClick={() => router.push("/forgot-password")}
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <KeyRound className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Enlace no valido</h1>
          <p className="text-muted-foreground">
            Necesitas un enlace válido para restablecer tu contraseña.
          </p>
        </div>

        <Button asChild className="h-11 w-full">
          <Link href="/forgot-password">Solicitar un nuevo enlace</Link>
        </Button>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="space-y-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="mb-2"
          onClick={() => router.push("/login")}
          aria-label="Volver al inicio de sesión"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Contraseña actualizada</h1>
          <p className="text-muted-foreground">
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>

        {hasFeedbackMessage ? (
          <FeedbackMessage message={state.message} variant="success" />
        ) : null}

        <Button asChild className="h-11 w-full">
          <Link href="/login">Ir al login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-2"
        onClick={() => router.push("/login")}
        aria-label="Volver"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Crea una nueva contraseña</h1>
        <p className="text-muted-foreground">
          Elige una nueva contraseña segura para tu cuenta.
        </p>
      </div>

      {state.status === "error" && hasFeedbackMessage ? (
        <FeedbackMessage message={state.message} variant="error" />
      ) : null}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <Label htmlFor="password">Nueva contraseña</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repite tu nueva contraseña"
            autoComplete="new-password"
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending ? "Actualizando..." : "Guardar nueva contraseña"}
        </Button>
      </form>
    </div>
  );
}