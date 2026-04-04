"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { initialAuthActionState } from "@/app/(auth)/action-state";
import {
  resendVerificationEmailAction,
  signInWithGoogleAction,
  signUpWithPasswordAction,
} from "@/app/(auth)/actions";
import { normalizeAuthActionState } from "@/components/auth/auth-action-state";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

interface SignUpPageClientProps {
  googleEnabled: boolean;
  redirectTo: string;
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

export default function SignUpPageClient({
  googleEnabled,
  redirectTo,
}: SignUpPageClientProps) {
  const router = useRouter();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [rawSignUpState, signUpAction, isSigningUp] = useActionState(
    signUpWithPasswordAction,
    initialAuthActionState,
  );
  const [rawResendState, resendAction, isResending] = useActionState(
    resendVerificationEmailAction,
    initialAuthActionState,
  );
  const signUpState = normalizeAuthActionState(rawSignUpState);
  const resendState = normalizeAuthActionState(rawResendState);
  const isLoading = isSigningUp || isResending;
  const hasSignUpFeedbackMessage = signUpState.message.trim().length > 0;
  const hasResendFeedbackMessage = resendState.message.trim().length > 0;

  if (signUpState.status === "success" && signUpState.email) {
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
          <h1 className="text-3xl font-bold tracking-tight">Confirma tu correo</h1>
          <p className="text-muted-foreground">
            Enviamos un enlace de confirmacion a
            {" "}
            <span className="font-medium text-foreground">{signUpState.email}</span>.
            Debes activarlo antes de iniciar sesion.
          </p>
        </div>

        <FeedbackMessage message={signUpState.message} variant="success" />

        {resendState.status !== "idle" && hasResendFeedbackMessage ? (
          <FeedbackMessage
            message={resendState.message}
            variant={resendState.status === "error" ? "error" : "success"}
          />
        ) : null}

        <div className="space-y-3">
          <Button
            type="button"
            className="h-11 w-full"
            onClick={() => router.push("/login")}
          >
            Ir al login
          </Button>
          <form action={resendAction}>
            <input type="hidden" name="email" value={signUpState.email} />
            <Button type="submit" variant="outline" className="h-11 w-full" disabled={isLoading}>
              {isResending ? "Reenviando correo..." : "Reenviar correo de confirmacion"}
            </Button>
          </form>
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
        <h1 className="text-3xl font-bold tracking-tight">Crea una cuenta</h1>
        <p className="text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Inicia sesion
          </Link>
        </p>
      </div>

      {signUpState.status === "error" && hasSignUpFeedbackMessage ? (
        <FeedbackMessage message={signUpState.message} variant="error" />
      ) : null}

      <form action={signUpAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombre</Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Pedro"
              autoComplete="given-name"
              defaultValue={signUpState.email ? undefined : ""}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellido</Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Pérez"
              autoComplete="family-name"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            defaultValue={signUpState.email ?? ""}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Minimo 8 caracteres"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repite tu contraseña"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            disabled={isLoading}
          />
          <label htmlFor="terms" className="cursor-pointer text-sm text-muted-foreground">
            Acepto los
            {" "}
            <Link
              href="/terms"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              Terminos y condiciones
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isLoading || !agreedToTerms}
        >
          {isSigningUp ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      <SocialButtons
        googleAction={signInWithGoogleAction}
        redirectTo={redirectTo}
        googleEnabled={googleEnabled}
        isLoading={isLoading}
      />
    </div>
  );
}