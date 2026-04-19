"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { initialAuthActionState } from "@/app/(auth)/action-state";
import {
  loginWithPasswordAction,
  requestMagicLinkAction,
  resendVerificationEmailAction,
  signInWithGoogleAction,
} from "@/app/(auth)/actions";
import { normalizeAuthActionState } from "@/components/auth/auth-action-state";
import { SocialButtons } from "@/components/auth/SocialButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

interface LoginPageClientProps {
  googleEnabled: boolean;
  magicLinkEnabled: boolean;
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

export default function LoginPageClient({
  googleEnabled,
  magicLinkEnabled,
  redirectTo,
}: LoginPageClientProps) {
  const router = useRouter();
  const [rawLoginState, loginAction, isLoginPending] = useActionState(
    loginWithPasswordAction,
    initialAuthActionState,
  );
  const [rawMagicLinkState, magicLinkAction, isMagicLinkPending] = useActionState(
    requestMagicLinkAction,
    initialAuthActionState,
  );
  const [rawResendState, resendAction, isResendPending] = useActionState(
    resendVerificationEmailAction,
    initialAuthActionState,
  );
  const loginState = normalizeAuthActionState(rawLoginState);
  const magicLinkState = normalizeAuthActionState(rawMagicLinkState);
  const resendState = normalizeAuthActionState(rawResendState);
  const isLoading = isLoginPending || isMagicLinkPending || isResendPending;
  const feedbackState =
    magicLinkState.status !== "idle"
      ? magicLinkState
      : resendState.status !== "idle"
        ? resendState
        : loginState;
  const hasFeedbackMessage = feedbackState.message.trim().length > 0;

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

      {feedbackState.status !== "idle" && hasFeedbackMessage ? (
        <FeedbackMessage
          message={feedbackState.message}
          variant={feedbackState.status === "error" ? "error" : "success"}
        />
      ) : null}

      <form action={loginAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            autoComplete="email"
            defaultValue={loginState.email ?? ""}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isLoading}>
          {isLoginPending ? "Iniciando sesion..." : "Iniciar sesion"}
        </Button>
      </form>

      {magicLinkEnabled ? (
        <div className="rounded-3xl border border-border/70 bg-muted/20 p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 className="text-base font-semibold">Entrar con enlace magico</h2>
              <p className="text-sm text-muted-foreground">
                Recibe un enlace seguro en tu correo y entra sin escribir tu contraseña.
              </p>
            </div>
          </div>

          <form action={magicLinkAction} className="mt-4 space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div className="space-y-2">
              <Label htmlFor="magic-link-email">Correo electronico</Label>
              <Input
                id="magic-link-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                defaultValue={magicLinkState.email ?? loginState.email ?? ""}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" variant="outline" className="h-11 w-full" disabled={isLoading}>
              {isMagicLinkPending ? "Enviando enlace..." : "Enviar enlace de acceso"}
            </Button>
          </form>
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          El acceso con enlace estara disponible cuando configures
          {" "}
          RESEND_API_KEY
          {" "}
          y
          {" "}
          RESEND_FROM_EMAIL.
        </p>
      )}

      {loginState.requiresEmailVerification && loginState.email ? (
        <form action={resendAction} className="rounded-2xl border border-border bg-muted/30 p-4">
          <input type="hidden" name="email" value={loginState.email} />
          <p className="text-sm text-muted-foreground">
            Si no encuentras el mensaje original, puedes pedir otro correo de confirmacion.
          </p>
          <Button
            type="submit"
            variant="link"
            className="mt-2 h-auto px-0"
            disabled={isLoading}
          >
            {isResendPending
              ? "Reenviando correo..."
              : "Reenviar correo de confirmacion"}
          </Button>
        </form>
      ) : null}

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