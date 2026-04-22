"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/app/(auth)/action-state";
import { isGoogleAuthEnabled, isResendConfigured } from "@/lib/auth/env";
import {
  buildPostLoginContinuationPath,
  registerUserWithPassword,
  requestMagicLinkLogin,
  requestPasswordReset,
  resendVerificationEmail,
  resetPasswordWithToken,
  validateCredentialsLogin,
} from "@/lib/auth/service";

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
  const redirectTo = buildPostLoginContinuationPath(
    getStringValue(formData, "redirectTo") || "/",
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
            "Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja o reenvía el correo.",
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
  const redirectTo = buildPostLoginContinuationPath(
    getStringValue(formData, "redirectTo") || "/",
  );

  if (!isGoogleAuthEnabled) {
    throw new Error("Google Auth no está configurado todavía.");
  }

  await signIn("google", { redirectTo });
}

export async function requestMagicLinkAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getStringValue(formData, "email");

  if (!isResendConfigured) {
    return {
      status: "error",
      email,
      message: "El acceso con enlace no está configurado todavía.",
    };
  }

  const redirectTo = buildPostLoginContinuationPath(
    getStringValue(formData, "redirectTo") || "/",
  );
  const result = await requestMagicLinkLogin(email);

  if (!result.ok) {
    return {
      status: "error",
      email,
      message: result.message,
    };
  }

  if (!result.eligible || !result.email) {
    return {
      status: "success",
      email: result.email ?? email,
      message: result.message,
    };
  }

  try {
    await signIn("resend", {
      email: result.email,
      redirect: false,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        email: result.email,
        message: "No pudimos enviar el enlace de acceso. Intenta nuevamente.",
      };
    }

    throw error;
  }

  return {
    status: "success",
    email: result.email,
    message: result.message,
  };
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