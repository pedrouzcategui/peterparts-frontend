import { redirect } from "next/navigation";
import { auth } from "@/auth";
import SignUpPageClient from "@/components/auth/SignUpPageClient";

function getRedirectTo(value: string | string[] | undefined): string {
  if (typeof value !== "string") {
    return "/";
  }

  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default async function SignUpPage({
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
    <SignUpPageClient
      redirectTo={redirectTo}
    />
  );
}
