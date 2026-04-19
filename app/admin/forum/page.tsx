import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, ShieldCheck, ShieldX, Trash2 } from "lucide-react";
import {
  approveAdminForumThreadAction,
  hardDeleteAdminForumThreadAction,
  rejectAdminForumThreadAction,
} from "@/app/admin/forum/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getForumThreadStatusLabel } from "@/lib/forum-data";
import { getAdminForumModerationData } from "@/lib/forum";

export const metadata: Metadata = {
  title: "Moderacion del foro",
};

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Sin revision";
  }

  return new Intl.DateTimeFormat("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadgeClassName(status: "pending" | "approved" | "rejected") {
  if (status === "approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300";
  }

  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300";
  }

  return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300";
}

export default async function AdminForumPage() {
  const moderation = await getAdminForumModerationData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Moderacion del foro</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Revisa las preguntas nuevas antes de publicarlas en la comunidad y administra el historial de aprobaciones.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-3xl">{moderation.counts.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Aprobadas</CardDescription>
            <CardTitle className="text-3xl">{moderation.counts.approved}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rechazadas</CardDescription>
            <CardTitle className="text-3xl">{moderation.counts.rejected}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cola de aprobacion</CardTitle>
          <CardDescription>
            Las publicaciones pendientes solo son visibles para el autor y para administracion hasta que se aprueben o se rechacen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moderation.pendingThreads.length > 0 ? (
            moderation.pendingThreads.map((thread) => (
              <article key={thread.id} className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{thread.title}</h2>
                      <Badge variant="outline" className={getStatusBadgeClassName(thread.status)}>
                        {getForumThreadStatusLabel(thread.status)}
                      </Badge>
                      {thread.isDeleted ? (
                        <Badge variant="outline">Retirada</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Por {thread.authorName} · {thread.authorEmail} · {formatDateTime(thread.createdAt)}
                    </p>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {thread.preview}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {thread.tags.map((tag) => (
                        <Badge key={`${thread.id}-${tag}`} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    {!thread.isDeleted ? (
                      <form action={approveAdminForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <Button type="submit" size="sm">
                          <ShieldCheck className="h-4 w-4" />
                          Aprobar
                        </Button>
                      </form>
                    ) : null}
                    {!thread.isDeleted ? (
                      <form action={rejectAdminForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <Button type="submit" size="sm" variant="outline">
                          <ShieldX className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </form>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <Link href={thread.path}>
                        <ExternalLink className="h-4 w-4" />
                        Abrir hilo
                      </Link>
                    </Button>
                    <form action={hardDeleteAdminForumThreadAction}>
                      <input type="hidden" name="threadId" value={thread.id} />
                      <Button type="submit" size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              No hay publicaciones pendientes de revision.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial reciente</CardTitle>
          <CardDescription>
            Publicaciones ya moderadas para cambiar su estado o limpiarlas definitivamente si hace falta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {moderation.reviewedThreads.length > 0 ? (
            moderation.reviewedThreads.map((thread) => (
              <article key={thread.id} className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{thread.title}</h2>
                      <Badge variant="outline" className={getStatusBadgeClassName(thread.status)}>
                        {getForumThreadStatusLabel(thread.status)}
                      </Badge>
                      {thread.isDeleted ? (
                        <Badge variant="outline">Retirada</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Por {thread.authorName} · {thread.authorEmail} · Creada {formatDateTime(thread.createdAt)} · Revisada {formatDateTime(thread.moderatedAt)}
                    </p>
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {thread.preview}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
                    {!thread.isDeleted && thread.status !== "approved" ? (
                      <form action={approveAdminForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <Button type="submit" size="sm">
                          <ShieldCheck className="h-4 w-4" />
                          Aprobar
                        </Button>
                      </form>
                    ) : null}
                    {!thread.isDeleted && thread.status !== "rejected" ? (
                      <form action={rejectAdminForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <Button type="submit" size="sm" variant="outline">
                          <ShieldX className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </form>
                    ) : null}
                    <Button asChild size="sm" variant="outline">
                      <Link href={thread.path}>
                        <ExternalLink className="h-4 w-4" />
                        Abrir hilo
                      </Link>
                    </Button>
                    <form action={hardDeleteAdminForumThreadAction}>
                      <input type="hidden" name="threadId" value={thread.id} />
                      <Button type="submit" size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              Todavia no hay publicaciones moderadas para mostrar.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}