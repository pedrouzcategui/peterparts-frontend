import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginPageClient from "@/components/auth/LoginPageClient";
import { isResendConfigured } from "@/lib/auth/env";
import { normalizeAuthRedirectTarget, resolvePostLoginRedirectTarget } from "@/lib/auth/service";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = normalizeAuthRedirectTarget(params.redirectTo);
  const session = await auth();

  if (session) {
    const destination = await resolvePostLoginRedirectTarget({
      email: session.user?.email,
      redirectTo,
    });

    redirect(destination);
  }

  return (
    <LoginPageClient
      magicLinkEnabled={isResendConfigured}
      redirectTo={redirectTo}
    />
  );
}
