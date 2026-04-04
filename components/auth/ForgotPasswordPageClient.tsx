"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { initialAuthActionState } from "@/app/(auth)/action-state";
import {
  requestPasswordResetAction,
} from "@/app/(auth)/actions";
import { normalizeAuthActionState } from "@/components/auth/auth-action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

export default function ForgotPasswordPageClient() {
  const router = useRouter();
  const [rawState, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    initialAuthActionState,
  );
  const state = normalizeAuthActionState(rawState);
  const hasFeedbackMessage = state.message.trim().length > 0;

  if (state.status === "success") {
    return (
      <div className="space-y-6">
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

        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Revisa tu correo</h1>
          <p className="text-muted-foreground">
            {state.email ? (
              <>
                Si existe una cuenta compatible, enviamos instrucciones a
                {" "}
                <span className="font-medium text-foreground">{state.email}</span>.
              </>
            ) : (
              state.message
            )}
          </p>
        </div>

        {hasFeedbackMessage ? (
          <FeedbackMessage message={state.message} variant="success" />
        ) : null}

        <div className="space-y-4">
          <Button
            type="button"
            className="h-11 w-full"
            onClick={() => router.push("/login")}
          >
            Volver a iniciar sesion
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            ¿Necesitas intentar con otro correo?{" "}
            <button
              type="button"
              onClick={() => router.refresh()}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Haz una nueva solicitud
            </button>
          </p>
        </div>
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
        onClick={() => router.back()}
        aria-label="Volver"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">¿Olvidaste tu contraseña?</h1>
        <p className="text-muted-foreground">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      {state.status === "error" && hasFeedbackMessage ? (
        <FeedbackMessage message={state.message} variant="error" />
      ) : null}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            defaultValue={state.email ?? ""}
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar enlace de recuperacion"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Recordaste tu contraseña?{" "}
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