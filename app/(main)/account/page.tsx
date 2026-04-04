import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, LogOut, MessageSquareText, PackageSearch, ShieldCheck, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { signOutAction } from "@/app/(main)/account/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getForumQuestionSummaryForUser } from "@/lib/forum";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null): string {
  if (!value) {
    return "Pendiente";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "long",
  }).format(value);
}

function buildLoginRedirectPath(redirectTo: string): string {
  return `/login?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  const sessionName = session?.user?.name?.trim() ?? null;

  if (!email) {
    redirect(buildLoginRedirectPath("/account"));
  }

  const currentUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      name: true,
      email: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });
  const questionSummary = await getForumQuestionSummaryForUser(currentUser?.email ? currentUser.id : null);

  const displayName =
    currentUser?.name?.trim() ||
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
    sessionName ||
    email;
  const authMethods = currentUser?.accounts.length
    ? Array.from(new Set(currentUser.accounts.map((account) => account.provider)))
    : ["credentials"];

  return (
    <div className="site-shell py-8 sm:py-10">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden rounded-[2rem] border-[#ebe7e0] py-0 shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:shadow-none">
          <div className="bg-[linear-gradient(135deg,#d91e36_0%,#630e19_100%)] px-6 py-8 text-white sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
                <UserRound className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
                  Mi cuenta
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  {displayName}
                </h1>
                <p className="mt-2 text-sm text-white/80 sm:text-base">{email}</p>
              </div>
            </div>
          </div>

          <CardContent className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Estado de acceso
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Correo verificado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(currentUser?.emailVerified ?? null)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Metodos de acceso
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {authMethods.map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-sm font-medium text-primary"
                  >
                    {method === "credentials" ? "Correo y contraseña" : "Google"}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-5 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Cuenta PeterParts
              </p>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Nombre</dt>
                  <dd className="mt-1 font-medium text-foreground">{displayName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Rol</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {currentUser?.role === "ADMIN" ? "Administrador" : "Cliente"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Correo</dt>
                  <dd className="mt-1 font-medium text-foreground">{email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Miembro desde</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatDate(currentUser?.createdAt ?? null)}
                  </dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-[#ebe7e0] shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Mi actividad</CardTitle>
              <CardDescription>
                Accesos rápidos para revisar tus compras y tus preguntas en el foro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <PackageSearch className="h-4 w-4 text-primary" />
                      Mis Compras
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Aun no hay un historial de compras disponible para clientes en esta version.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">0</span>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/products">Explorar productos</Link>
                </Button>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <MessageSquareText className="h-4 w-4 text-primary" />
                      Mis Preguntas
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tus preguntas publicadas en la comunidad PeterParts.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
                    {questionSummary.count}
                  </span>
                </div>

                {questionSummary.recentThreads.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    {questionSummary.recentThreads.map((thread) => (
                      <Link
                        key={thread.slug ?? thread.id}
                        href={`/forum/${thread.slug ?? thread.id}`}
                        className="block rounded-2xl border border-border/70 bg-background px-3 py-3 text-sm transition-colors hover:border-primary/20 hover:bg-muted/60"
                      >
                        <span className="font-medium text-foreground">{thread.title}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Todavia no has publicado preguntas. Puedes crear la primera desde el foro.
                  </p>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="flex-1">
                    <Link href="/forum/new">Crear pregunta</Link>
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/forum">Ir al foro</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-[#ebe7e0] shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Sesion activa
              </CardTitle>
              <CardDescription>
                Este espacio hace visible tu estado de autenticacion y te permite salir de forma segura.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="h-11 w-full">
                <Link href="/products">Seguir comprando</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="outline" className="h-11 w-full">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesion
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}