import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";
import {
  getGoogleClientId,
  getGoogleClientSecret,
  getResendApiKey,
  getResendFromEmail,
  isGoogleAuthEnabled,
  isResendConfigured,
} from "@/lib/auth/env";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import {
  isMagicLinkEligibleEmail,
  syncGoogleUserProfile,
  validateCredentialsLogin,
} from "@/lib/auth/service";

function hasVerifiedGoogleEmail(
  profile: unknown,
): profile is { email_verified?: boolean } {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  return "email_verified" in profile;
}

function normalizeEmailIdentifier(identifier: string): string {
  const [local, domain = ""] = identifier.toLowerCase().trim().split("@");
  return `${local}@${domain.split(",")[0]}`;
}

function buildProviders() {
  const googleClientId = getGoogleClientId();
  const googleClientSecret = getGoogleClientSecret();
  const resendApiKey = getResendApiKey();

  return [
    Credentials({
      name: "Correo y contraseña",
      credentials: {
        email: {
          label: "Correo",
          type: "email",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        const result = await validateCredentialsLogin(email, password);

        if (!result.ok) {
          return null;
        }

        return result.user;
      },
    }),
    ...(isResendConfigured && resendApiKey
      ? [
          Resend({
            apiKey: resendApiKey,
            from: getResendFromEmail(),
            normalizeIdentifier(identifier) {
              return normalizeEmailIdentifier(identifier);
            },
            async sendVerificationRequest({ identifier, url }) {
              await sendMagicLinkEmail({
                email: identifier,
                url,
              });
            },
          }),
        ]
      : []),
    ...(isGoogleAuthEnabled
      ? [
          Google({
            allowDangerousEmailAccountLinking: true,
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
          }),
        ]
      : []),
  ];
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: buildProviders(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.id) {
        await syncGoogleUserProfile({
          userId: user.id,
          name: user.name ?? null,
          emailVerified: hasVerifiedGoogleEmail(profile)
            ? Boolean(profile.email_verified)
            : false,
        });
      }

      if (account?.type === "email") {
        const signInEmail = typeof user.email === "string" ? user.email : null;

        if (!signInEmail) {
          return "/login";
        }

        const allowed = await isMagicLinkEligibleEmail(signInEmail);

        if (!allowed) {
          return "/login";
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      return token;
    },
  },
});