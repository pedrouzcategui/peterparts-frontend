import "server-only";

import path from "node:path";
import { readFile } from "node:fs/promises";
import { Resend } from "resend";
import {
  getAppUrl,
  getResendApiKey,
  getResendFromEmail,
  isResendConfigured,
} from "@/lib/auth/env";

let resendClient: Resend | null = null;

const BRAND_COLORS = {
  primary: "#D91E36",
  secondary: "#630E19",
  text: "#1A1714",
  white: "#FFFFFF",
} as const;

const LOGO_CONTENT_ID = "peterparts-logo";

function getResendClient(): Resend {
  const apiKey = getResendApiKey();

  if (!isResendConfigured || !apiKey) {
    throw new Error(
      "RESEND_API_KEY and RESEND_FROM_EMAIL must be configured to send auth emails.",
    );
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

async function getInlineLogoAttachment() {
  const logoPath = path.join(process.cwd(), "public", "images", "logo-dark.png");
  const content = await readFile(logoPath);

  return {
    filename: "peterparts-logo-dark.png",
    content,
    contentType: "image/png",
    contentId: LOGO_CONTENT_ID,
  };
}

function buildEmailShell({
  previewText,
  supportLine,
  heading,
  body,
  ctaLabel,
  ctaUrl,
}: {
  previewText: string;
  supportLine: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
}): { html: string; text: string } {
  const html = `
    <div style="margin:0;background:${BRAND_COLORS.secondary};padding:40px 16px;font-family:'Open Sans',Arial,sans-serif;color:${BRAND_COLORS.text};">
      <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,0.2);border-radius:28px;overflow:hidden;background:${BRAND_COLORS.white};box-shadow:0 22px 60px rgba(26,23,20,0.24);">
        <div style="background:${BRAND_COLORS.primary};padding:28px 32px;text-align:center;">
          <img src="cid:${LOGO_CONTENT_ID}" alt="PeterParts" style="display:inline-block;width:196px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;vertical-align:middle;" />
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 12px;font-family:'Lato',Arial,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND_COLORS.secondary};font-weight:700;">${previewText}</p>
          <h1 style="margin:0 0 16px;font-size:34px;line-height:1.15;color:${BRAND_COLORS.text};font-weight:800;">${heading}</h1>
          <p style="margin:0 0 24px;font-family:'Lato',Arial,sans-serif;font-size:17px;line-height:1.7;color:${BRAND_COLORS.text};">${body}</p>
          <a href="${ctaUrl}" style="display:inline-block;background:${BRAND_COLORS.primary};color:${BRAND_COLORS.white};text-decoration:none;padding:15px 26px;border-radius:999px;font-weight:800;font-size:15px;">${ctaLabel}</a>
          <div style="margin:28px 0 0;padding-top:24px;border-top:1px solid ${BRAND_COLORS.secondary};">
            <p style="margin:0 0 10px;font-family:'Lato',Arial,sans-serif;font-size:13px;line-height:1.6;color:${BRAND_COLORS.secondary};font-weight:700;">${supportLine}</p>
            <p style="margin:0;font-family:'Lato',Arial,sans-serif;font-size:13px;line-height:1.7;color:${BRAND_COLORS.text};">Si el boton no abre, copia y pega este enlace en tu navegador:</p>
            <p style="margin:8px 0 0;font-family:'Lato',Arial,sans-serif;font-size:13px;line-height:1.7;word-break:break-all;color:${BRAND_COLORS.primary};">${ctaUrl}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const text = `${heading}\n\n${body}\n\n${supportLine}\n\n${ctaLabel}: ${ctaUrl}`;

  return { html, text };
}

export async function sendVerificationEmail({
  email,
  firstName,
  token,
}: {
  email: string;
  firstName: string | null;
  token: string;
}): Promise<void> {
  const confirmationUrl = `${getAppUrl()}/verify-email?token=${token}`;
  const greetingName = firstName ?? "hola";
  const { html, text } = buildEmailShell({
    previewText: "Confirma tu correo para activar tu cuenta",
    supportLine: "Soporte KitchenAid y repuestos premium PeterParts",
    heading: "Confirma tu correo en PeterParts",
    body: `${greetingName}, confirma tu correo para activar tu cuenta y poder iniciar sesion con tu contraseña.`,
    ctaLabel: "Confirmar correo",
    ctaUrl: confirmationUrl,
  });
  const logoAttachment = await getInlineLogoAttachment();

  await getResendClient().emails.send({
    from: getResendFromEmail(),
    to: email,
    subject: "Confirma tu correo en PeterParts",
    html,
    text,
    attachments: [logoAttachment],
  });
}

export async function sendPasswordResetEmail({
  email,
  firstName,
  token,
}: {
  email: string;
  firstName: string | null;
  token: string;
}): Promise<void> {
  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
  const greetingName = firstName ?? "hola";
  const { html, text } = buildEmailShell({
    previewText: "Restablece tu contraseña",
    supportLine: "Acceso seguro para clientes PeterParts",
    heading: "Restablece tu contraseña",
    body: `${greetingName}, recibimos una solicitud para cambiar tu contraseña. Si fuiste tu, usa el siguiente enlace.`,
    ctaLabel: "Crear nueva contraseña",
    ctaUrl: resetUrl,
  });
  const logoAttachment = await getInlineLogoAttachment();

  await getResendClient().emails.send({
    from: getResendFromEmail(),
    to: email,
    subject: "Restablece tu contraseña de PeterParts",
    html,
    text,
    attachments: [logoAttachment],
  });
}

export async function sendMagicLinkEmail({
  email,
  url,
}: {
  email: string;
  url: string;
}): Promise<void> {
  const { html, text } = buildEmailShell({
    previewText: "Usa tu enlace seguro para iniciar sesion",
    supportLine: "Acceso rapido y seguro para clientes PeterParts",
    heading: "Tu enlace de acceso esta listo",
    body:
      "Recibimos una solicitud para iniciar sesion sin contraseña. Usa este enlace seguro para acceder a tu cuenta PeterParts.",
    ctaLabel: "Iniciar sesion con enlace",
    ctaUrl: url,
  });
  const logoAttachment = await getInlineLogoAttachment();

  await getResendClient().emails.send({
    from: getResendFromEmail(),
    to: email,
    subject: "Tu enlace de acceso a PeterParts",
    html,
    text,
    attachments: [logoAttachment],
  });
}
