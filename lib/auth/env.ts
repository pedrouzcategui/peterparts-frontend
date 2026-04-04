import "server-only";

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeEnvValue(value: string | undefined): string | null {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export function getGoogleClientId(): string | null {
  return normalizeEnvValue(process.env.AUTH_GOOGLE_ID)
    ?? normalizeEnvValue(process.env.GOOGLE_CLIENT_ID);
}

export function getGoogleClientSecret(): string | null {
  return normalizeEnvValue(process.env.AUTH_GOOGLE_SECRET)
    ?? normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET);
}

export const isGoogleAuthEnabled = Boolean(
  getGoogleClientId() && getGoogleClientSecret(),
);

export const isResendConfigured = Boolean(
  normalizeEnvValue(process.env.RESEND_API_KEY) &&
    normalizeEnvValue(process.env.RESEND_FROM_EMAIL),
);

export function getAppUrl(): string {
  const configuredUrl =
    normalizeEnvValue(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeEnvValue(process.env.AUTH_URL) ??
    normalizeEnvValue(process.env.NEXTAUTH_URL) ??
    normalizeEnvValue(process.env.APP_URL) ??
    (normalizeEnvValue(process.env.VERCEL_URL)
      ? `https://${normalizeEnvValue(process.env.VERCEL_URL)}`
      : null);

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  return "http://localhost:3000";
}

export function getResendFromEmail(): string {
  const fromEmail = normalizeEnvValue(process.env.RESEND_FROM_EMAIL);

  if (!fromEmail) {
    throw new Error(
      "RESEND_FROM_EMAIL is not configured. Set it before using email confirmation.",
    );
  }

  return fromEmail;
}