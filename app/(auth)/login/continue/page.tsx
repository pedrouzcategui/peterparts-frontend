import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  buildLoginSuccessRedirectPath,
  normalizeAuthRedirectTarget,
  resolvePostLoginRedirectTarget,
} from "@/lib/auth/service";

export default async function LoginContinuePage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const redirectTo = normalizeAuthRedirectTarget(params.redirectTo);
  const session = await auth();

  if (!session) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const destination = await resolvePostLoginRedirectTarget({
    email: session.user?.email,
    redirectTo,
  });

  redirect(buildLoginSuccessRedirectPath(destination));
}