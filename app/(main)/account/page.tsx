import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PackageSearch,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { auth } from "@/auth";
import { signOutAction } from "@/app/(main)/account/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFavouriteCountForUser } from "@/lib/favourites";
import { getForumQuestionSummaryForUser } from "@/lib/forum";
import { getCustomerOrders } from "@/lib/order-data";
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusPresentation,
  type OrderDisplayStatus,
} from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { getUserRoleLabel } from "@/lib/user-roles";

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

function OrderStatusBadge({ status }: { status: OrderDisplayStatus }) {
  const presentation = getOrderStatusPresentation(status);

  return (
    <Badge
      variant={presentation.variant}
      className={`capitalize ${presentation.className}`}
    >
      {presentation.label}
    </Badge>
  );
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

  const [questionSummary, favouriteCount, customerOrders] = await Promise.all([
    getForumQuestionSummaryForUser(currentUser?.id ?? null),
    currentUser?.id ? getFavouriteCountForUser(currentUser.id) : Promise.resolve(0),
    getCustomerOrders(currentUser?.id ?? null, email),
  ]);

  const recentOrders = customerOrders.slice(0, 6);
  const latestOrder = customerOrders[0] ?? null;
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
        <div className="space-y-6">
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
                      {method === "credentials" ? "Correo y contrasena" : "Google"}
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
                      {currentUser?.role ? getUserRoleLabel(currentUser.role) : "Guest"}
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

          <Card
            id="pedidos"
            className="rounded-[2rem] border-[#ebe7e0] shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:shadow-none"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <PackageSearch className="h-5 w-5 text-primary" />
                Mis pedidos
              </CardTitle>
              <CardDescription>
                Aqui aparece el historial real de los pedidos creados con tu cuenta o con tu correo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[1.5rem] border border-border/70 bg-muted/20 p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Pedido {order.orderNumber}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Registrado el {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Total
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {formatOrderCurrency(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Articulos
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {order.itemCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          Contacto
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Seguimiento por WhatsApp
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background px-3 py-3 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-foreground">
                              {item.name}
                            </p>
                            <p className="text-muted-foreground">
                              {item.variantLabel ? `${item.variantLabel} · ` : ""}
                              {item.quantity} unidad{item.quantity === 1 ? "" : "es"}
                            </p>
                          </div>
                          <p className="font-medium text-foreground">
                            {formatOrderCurrency(item.totalPrice)}
                          </p>
                        </div>
                      ))}
                      {order.items.length > 3 ? (
                        <p className="text-sm text-muted-foreground">
                          Y {order.items.length - 3} articulo{order.items.length - 3 === 1 ? "" : "s"} mas.
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Button asChild variant="outline" className="sm:w-auto">
                        <a href={order.whatsappUrl} target="_blank" rel="noreferrer">
                          Seguimiento por WhatsApp
                        </a>
                      </Button>
                      <Button asChild variant="ghost" className="sm:w-auto">
                        <Link href="/products">Seguir comprando</Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border/80 bg-muted/20 px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Todavia no tienes pedidos registrados. Cuando crees uno desde el checkout, aparecera aqui automaticamente.
                  </p>
                  <Button asChild className="mt-4">
                    <Link href="/products">Explorar productos</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-[#ebe7e0] shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Mi actividad</CardTitle>
              <CardDescription>
                Accesos rapidos para revisar tus compras y tus preguntas en el foro.
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
                      {customerOrders.length > 0
                        ? latestOrder
                          ? `Tienes ${customerOrders.length} pedido${customerOrders.length === 1 ? "" : "s"} registrado${customerOrders.length === 1 ? "" : "s"}. El mas reciente es ${latestOrder.orderNumber}.`
                          : `Tienes ${customerOrders.length} pedido${customerOrders.length === 1 ? "" : "s"} registrado${customerOrders.length === 1 ? "" : "s"}.`
                        : "Aun no has creado pedidos desde esta cuenta."}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
                    {customerOrders.length}
                  </span>
                </div>
                {latestOrder ? (
                  <div className="mt-4 rounded-2xl border border-border/60 bg-background px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{latestOrder.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatOrderCurrency(latestOrder.total)}
                        </p>
                      </div>
                      <OrderStatusBadge status={latestOrder.status} />
                    </div>
                  </div>
                ) : null}
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href={customerOrders.length > 0 ? "/account#pedidos" : "/products"}>
                    {customerOrders.length > 0 ? "Ver pedidos" : "Explorar productos"}
                  </Link>
                </Button>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-muted/25 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-foreground">
                      <Heart className="h-4 w-4 text-primary" />
                      Favoritos
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tus productos guardados para revisarlos o comprarlos despues.
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold text-foreground">
                    {favouriteCount}
                  </span>
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/favourites">Ver favoritos</Link>
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
              {currentUser?.role === "ADMIN" ? (
                <Button asChild variant="outline" className="h-11 w-full">
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    Ir al panel admin
                  </Link>
                </Button>
              ) : null}
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
