import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginPageClient from "@/components/auth/LoginPageClient";
import { isGoogleAuthEnabled } from "@/lib/auth/env";

function getRedirectTo(value: string | string[] | undefined): string {
  if (typeof value !== "string") {
    return "/";
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = getRedirectTo(params.redirectTo);
  const session = await auth();

  if (session) {
    redirect(redirectTo);
  }

  return (
    <LoginPageClient
      googleEnabled={isGoogleAuthEnabled}
      redirectTo={redirectTo}
    />
  );
}
