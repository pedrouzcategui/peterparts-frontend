import ResetPasswordPageClient from "@/components/auth/ResetPasswordPageClient";

function getToken(value: string | string[] | undefined): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return <ResetPasswordPageClient token={getToken(params.token)} />;
}