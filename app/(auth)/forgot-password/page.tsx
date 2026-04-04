import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ForgotPasswordPageClient from "@/components/auth/ForgotPasswordPageClient";

export default async function ForgotPasswordPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return <ForgotPasswordPageClient />;
}
