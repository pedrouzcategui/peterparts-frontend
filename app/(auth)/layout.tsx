import { AuthLayout } from "@/components/auth/AuthLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuenta",
  description: "Inicia sesion o crea una cuenta en PeterParts",
};

export default function AuthLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
