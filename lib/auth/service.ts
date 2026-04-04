import "server-only";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth/email";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth/password";
import { generateToken, hashToken } from "@/lib/auth/tokens";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 60;
const GENERIC_PASSWORD_RESET_MESSAGE =
  "Si encontramos una cuenta compatible, te enviaremos instrucciones a tu correo.";

type CredentialsFailureReason =
  | "invalid_credentials"
  | "email_not_verified"
  | "google_only";

export interface CredentialsValidationResult {
  ok: true;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

export interface CredentialsValidationError {
  ok: false;
  reason: CredentialsFailureReason;
}

export type CredentialsValidationResponse =
  | CredentialsValidationResult
  | CredentialsValidationError;

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthMutationResult {
  ok: boolean;
  message: string;
  email?: string;
}

export interface TokenConfirmationResult {
  ok: boolean;
  message: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): string | null {
  const normalizedEmail = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return "Ingresa un correo valido.";
  }

  return null;
}

function normalizeName(value: string, fieldLabel: string): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    throw new Error(`El campo ${fieldLabel} es obligatorio.`);
  }

  return normalized;
}

function buildDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

function splitDisplayName(name: string): { firstName: string | null; lastName: string | null } {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return {
      firstName: null,
      lastName: null,
    };
  }

  const [firstName, ...rest] = normalized.split(" ");

  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : null,
  };
}

export async function validateCredentialsLogin(
  email: string,
  password: string,
): Promise<CredentialsValidationResponse> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      ok: false,
      reason: "invalid_credentials",
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      passwordHash: true,
      emailVerified: true,
      accounts: {
        select: {
          provider: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return {
      ok: false,
      reason: "invalid_credentials",
    };
  }

  if (!user.passwordHash) {
    return {
      ok: false,
      reason: user.accounts.length > 0 ? "google_only" : "invalid_credentials",
    };
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    return {
      ok: false,
      reason: "invalid_credentials",
    };
  }

  if (!user.emailVerified) {
    return {
      ok: false,
      reason: "email_not_verified",
    };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  };
}

export async function registerUserWithPassword(
  input: RegisterUserInput,
): Promise<AuthMutationResult> {
  const firstName = normalizeName(input.firstName, "nombre");
  const lastName = normalizeName(input.lastName, "apellido");
  const email = normalizeEmail(input.email);
  const emailError = validateEmail(email);

  if (emailError) {
    return {
      ok: false,
      message: emailError,
    };
  }

  const passwordError = validatePassword(input.password);

  if (passwordError) {
    return {
      ok: false,
      message: passwordError,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      emailVerified: true,
      passwordHash: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (existingUser?.emailVerified) {
    return {
      ok: false,
      message:
        existingUser.accounts.length > 0 && !existingUser.passwordHash
          ? "Este correo ya esta asociado a Google. Usa el acceso con Google para entrar."
          : "Ya existe una cuenta con este correo.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const name = buildDisplayName(firstName, lastName);
  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  const user = await prisma.$transaction(async (transaction) => {
    if (existingUser) {
      const updatedUser = await transaction.user.update({
        where: { id: existingUser.id },
        data: {
          firstName,
          lastName,
          name,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
        },
      });

      await transaction.emailVerificationToken.deleteMany({
        where: { userId: existingUser.id },
      });

      await transaction.emailVerificationToken.create({
        data: {
          userId: existingUser.id,
          email,
          tokenHash,
          expiresAt,
        },
      });

      return updatedUser;
    }

    return transaction.user.create({
      data: {
        firstName,
        lastName,
        name,
        email,
        passwordHash,
        emailVerificationTokens: {
          create: {
            email,
            tokenHash,
            expiresAt,
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
      },
    });
  });

  try {
    await sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  } catch (error) {
    return {
      ok: false,
      email: user.email,
      message:
        error instanceof Error
          ? error.message
          : "No pudimos enviar el correo de confirmacion. Intenta nuevamente.",
    };
  }

  return {
    ok: true,
    email: user.email,
    message:
      "Te enviamos un correo de confirmacion. Debes confirmar tu email antes de iniciar sesion.",
  };
}

export async function resendVerificationEmail(
  email: string,
): Promise<AuthMutationResult> {
  const normalizedEmail = normalizeEmail(email);
  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    return {
      ok: false,
      message: emailError,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      firstName: true,
      emailVerified: true,
    },
  });

  if (!user || user.emailVerified) {
    return {
      ok: true,
      email: normalizedEmail,
      message:
        "Si existe una cuenta pendiente por confirmar, acabamos de enviar un nuevo correo.",
    };
  }

  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.$transaction(async (transaction) => {
    await transaction.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    await transaction.emailVerificationToken.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  } catch (error) {
    return {
      ok: false,
      email: user.email,
      message:
        error instanceof Error
          ? error.message
          : "No pudimos reenviar el correo de confirmacion.",
    };
  }

  return {
    ok: true,
    email: user.email,
    message:
      "Si existe una cuenta pendiente por confirmar, acabamos de enviar un nuevo correo.",
  };
}

export async function confirmEmailVerification(
  token: string,
): Promise<TokenConfirmationResult> {
  if (!token) {
    return {
      ok: false,
      message: "El enlace de confirmacion no es valido.",
    };
  }

  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    select: {
      id: true,
      expiresAt: true,
      userId: true,
    },
  });

  if (!verificationToken) {
    return {
      ok: false,
      message: "Este enlace ya no es valido o ya fue utilizado.",
    };
  }

  if (verificationToken.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    return {
      ok: false,
      message: "Este enlace vencio. Solicita un nuevo correo de confirmacion.",
    };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    await transaction.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    });
  });

  return {
    ok: true,
    message: "Tu correo quedo confirmado. Ya puedes iniciar sesion.",
  };
}

export async function requestPasswordReset(
  email: string,
): Promise<AuthMutationResult> {
  const normalizedEmail = normalizeEmail(email);
  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    return {
      ok: false,
      message: emailError,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      firstName: true,
      emailVerified: true,
      passwordHash: true,
    },
  });

  if (!user || !user.emailVerified || !user.passwordHash) {
    return {
      ok: true,
      email: normalizedEmail,
      message: GENERIC_PASSWORD_RESET_MESSAGE,
    };
  }

  const { token, tokenHash } = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.$transaction(async (transaction) => {
    await transaction.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await transaction.passwordResetToken.create({
      data: {
        userId: user.id,
        email: user.email,
        tokenHash,
        expiresAt,
      },
    });
  });

  try {
    await sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  } catch (error) {
    return {
      ok: false,
      email: user.email,
      message:
        error instanceof Error
          ? error.message
          : "No pudimos enviar el correo para restablecer tu contraseña.",
    };
  }

  return {
    ok: true,
    email: normalizedEmail,
    message: GENERIC_PASSWORD_RESET_MESSAGE,
  };
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<TokenConfirmationResult> {
  if (!token) {
    return {
      ok: false,
      message: "El enlace para restablecer la contraseña no es valido.",
    };
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    return {
      ok: false,
      message: passwordError,
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    select: {
      id: true,
      expiresAt: true,
      userId: true,
    },
  });

  if (!resetToken) {
    return {
      ok: false,
      message: "Este enlace ya no es valido o ya fue utilizado.",
    };
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return {
      ok: false,
      message: "Este enlace vencio. Solicita uno nuevo para cambiar tu contraseña.",
    };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
      },
    });

    await transaction.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });
  });

  return {
    ok: true,
    message: "Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesion.",
  };
}

export async function syncGoogleUserProfile({
  userId,
  name,
  emailVerified,
}: {
  userId: string;
  name: string | null;
  emailVerified: boolean;
}): Promise<void> {
  const updates: {
    name?: string;
    firstName?: string;
    lastName?: string;
    emailVerified?: Date;
  } = {};

  if (name) {
    const normalizedName = name.trim().replace(/\s+/g, " ");

    if (normalizedName) {
      const parts = splitDisplayName(normalizedName);
      updates.name = normalizedName;

      if (parts.firstName) {
        updates.firstName = parts.firstName;
      }

      if (parts.lastName) {
        updates.lastName = parts.lastName;
      }
    }
  }

  if (emailVerified) {
    updates.emailVerified = new Date();
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: updates,
  });
}