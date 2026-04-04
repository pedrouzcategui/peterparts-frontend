import Link from "next/link";
import { CheckCircle2, MailX } from "lucide-react";
import { confirmEmailVerification } from "@/lib/auth/service";
import { Button } from "@/components/ui/button";

function getToken(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const result = await confirmEmailVerification(getToken(params.token));

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {result.ok ? (
            <CheckCircle2 className="h-8 w-8 text-primary" />
          ) : (
            <MailX className="h-8 w-8 text-primary" />
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {result.ok ? "Correo confirmado" : "No pudimos confirmar tu correo"}
        </h1>
        <p className="text-muted-foreground">{result.message}</p>
      </div>

      <div className="space-y-3">
        <Button asChild className="h-11 w-full">
          <Link href="/login">Ir al login</Link>
        </Button>
        {!result.ok ? (
          <Button asChild variant="outline" className="h-11 w-full">
            <Link href="/signup">Volver al registro</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}