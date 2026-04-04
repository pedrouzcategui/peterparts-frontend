"use server";

import { signIn } from "@/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/app/(auth)/action-state";
import { isGoogleAuthEnabled } from "@/lib/auth/env";
import {
  registerUserWithPassword,
  requestPasswordReset,
  resendVerificationEmail,
  resetPasswordWithToken,
  validateCredentialsLogin,
} from "@/lib/auth/service";

function normalizeRedirectTo(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function buildLoginSuccessRedirect(redirectTo: string): string {
  const [pathWithQuery, hash = ""] = redirectTo.split("#", 2);
  const [pathname, query = ""] = pathWithQuery.split("?", 2);
  const params = new URLSearchParams(query);

  params.set("auth", "login-success");

  const nextQuery = params.toString();

  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`;
}

function getStringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginWithPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const redirectTo = buildLoginSuccessRedirect(
    normalizeRedirectTo(getStringValue(formData, "redirectTo") || "/"),
  );
  const validation = await validateCredentialsLogin(email, password);

  if (!validation.ok) {
    switch (validation.reason) {
      case "email_not_verified":
        return {
          status: "error",
          email,
          requiresEmailVerification: true,
          message:
            "Debes confirmar tu correo antes de iniciar sesion. Revisa tu bandeja o reenvia el correo.",
        };
      case "google_only":
        return {
          status: "error",
          email,
          message:
            "Esta cuenta fue creada con Google. Usa el acceso con Google para continuar.",
        };
      default:
        return {
          status: "error",
          email,
          message: "Correo o contraseña incorrectos.",
        };
    }
  }

  await signIn("credentials", {
    email,
    password,
    redirectTo,
  });

  return initialAuthActionState;
}

export async function signInWithGoogleAction(formData: FormData): Promise<void> {
  const redirectTo = buildLoginSuccessRedirect(
    normalizeRedirectTo(getStringValue(formData, "redirectTo") || "/"),
  );

  if (!isGoogleAuthEnabled) {
    throw new Error("Google Auth no esta configurado todavia.");
  }

  await signIn("google", { redirectTo });
}

export async function signUpWithPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const firstName = getStringValue(formData, "firstName");
  const lastName = getStringValue(formData, "lastName");
  const email = getStringValue(formData, "email");
  const password = getStringValue(formData, "password");
  const confirmPassword = getStringValue(formData, "confirmPassword");

  if (password !== confirmPassword) {
    return {
      status: "error",
      email,
      message: "Las contraseñas no coinciden.",
    };
  }

  const result = await registerUserWithPassword({
    firstName,
    lastName,
    email,
    password,
  });

  return {
    status: result.ok ? "success" : "error",
    email: result.email,
    message: result.message,
  };
}

export async function resendVerificationEmailAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email");
  const result = await resendVerificationEmail(email);

  return {
    status: result.ok ? "success" : "error",
    email: result.email,
    message: result.message,
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email");
  const result = await requestPasswordReset(email);

  return {
    status: result.ok ? "success" : "error",
    email: result.email,
    message: result.message,
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const token = getStringValue(formData, "token");
  const password = getStringValue(formData, "password");
  const confirmPassword = getStringValue(formData, "confirmPassword");

  if (password !== confirmPassword) {
    return {
      status: "error",
      message: "Las contraseñas no coinciden.",
    };
  }

  const result = await resetPasswordWithToken(token, password);

  return {
    status: result.ok ? "success" : "error",
    message: result.message,
  };
}