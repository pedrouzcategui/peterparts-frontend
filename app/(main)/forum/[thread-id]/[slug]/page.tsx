import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageSquare, Pencil, Trash2 } from "lucide-react";
import {
  buildForumLoginRedirectPath,
  buildForumThreadPath,
  getCurrentForumUser,
  getForumThreadData,
} from "@/lib/forum";
import {
  createForumReplyAction,
  hardDeleteForumThreadAction,
  softDeleteForumThreadAction,
  updateForumThreadAction,
} from "@/app/(main)/forum/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VoteButtons from "@/components/forum/VoteButtons";
import ShareThreadButton from "@/components/forum/ShareThreadButton";
import CommentItem from "@/components/forum/CommentItem";
import ForumSidebar from "@/components/forum/ForumSidebar";
import type { ForumComment } from "@/lib/forum-data";
import {
  formatRelativeTime,
  getForumThreadStatusLabel,
} from "@/lib/forum-data";

interface ThreadPageProps {
  params: Promise<{ "thread-id": string; slug: string }>;
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

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { "thread-id": threadId } = await params;
  const thread = await getForumThreadData(threadId);

  if (!thread) {
    return {
      title: "Hilo no encontrado",
    };
  }

  return {
    title: thread.title,
    description: thread.content.slice(0, 160),
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { "thread-id": threadId, slug } = await params;
  const [thread, currentUser] = await Promise.all([
    getForumThreadData(threadId),
    getCurrentForumUser(),
  ]);

  if (!thread) {
    notFound();
  }

  const threadPath = buildForumThreadPath(thread);

  if (slug !== thread.slug) {
    redirect(threadPath);
  }

  const isSignedIn = Boolean(currentUser);
  const canReply = Boolean(thread.canReply);
  const replyHref = canReply
    ? isSignedIn
      ? "#reply-form"
      : buildForumLoginRedirectPath(threadPath)
    : null;
  const replyLabel = canReply
    ? isSignedIn
      ? "Responder"
      : "Inicia sesion para responder"
    : undefined;
  const replyAuthorName = currentUser?.name ?? "Tu cuenta";
  const decorateComments = (comments: ForumComment[]): ForumComment[] =>
    comments.map((comment) => ({
      ...comment,
      canEdit: !comment.isDeleted && comment.author.id === currentUser?.id,
      canDelete: !comment.isDeleted && comment.author.id === currentUser?.id,
      replies: comment.replies ? decorateComments(comment.replies) : [],
    }));
  const decoratedComments = decorateComments(thread.comments);
  const canManageThread = Boolean(thread.canEdit || thread.canDelete);
  const canHardDeleteThread = currentUser?.role === "ADMIN";
  const threadScore = thread.upvotes - thread.downvotes;
  const moderationMessage =
    thread.status === "pending"
      ? currentUser?.id === thread.author.id
        ? "Tu publicacion esta pendiente de aprobacion. Solo tu y el equipo administrador pueden verla por ahora."
        : "Esta publicacion esta pendiente de aprobacion. Solo el autor y los administradores pueden verla por ahora."
      : thread.status === "rejected"
        ? currentUser?.id === thread.author.id
          ? "Tu publicacion fue rechazada y sigue oculta para el resto de la comunidad."
          : "Esta publicacion fue rechazada y sigue oculta para el resto de la comunidad."
        : null;
  const replyAvailabilityMessage = thread.isDeleted
    ? "No se pueden agregar respuestas a una publicacion retirada."
    : thread.status === "pending"
      ? "Las respuestas se habilitaran cuando un administrador apruebe esta publicacion."
      : thread.status === "rejected"
        ? "Esta publicacion fue rechazada y no acepta respuestas mientras permanezca oculta."
        : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/forum"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al foro
      </Link>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {thread.status === "approved" && !thread.isDeleted ? (
                  <VoteButtons
                    entityType="thread"
                    entityId={thread.id}
                    initialUpvotes={thread.upvotes}
                    initialDownvotes={thread.downvotes}
                    initialVoteState={thread.currentUserVote ?? null}
                    orientation="vertical"
                  />
                ) : (
                  <div className="flex w-12 shrink-0 flex-col items-center justify-start pt-1 text-xs text-muted-foreground">
                    <span className="text-base font-semibold text-foreground">
                      {threadScore}
                    </span>
                    <span>votos</span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                          {thread.author.initials}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          {thread.author.name}
                        </span>
                        <p className="text-xs">
                          Publicado {formatRelativeTime(thread.createdAt)}
                          {thread.isEdited ? " • editado" : ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold">{thread.title}</h1>
                    {thread.status !== "approved" ? (
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClassName(thread.status)}
                      >
                        {getForumThreadStatusLabel(thread.status)}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {thread.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="prose prose-sm mb-4 max-w-none dark:prose-invert">
                    <p className={thread.isDeleted ? "italic text-muted-foreground" : undefined}>
                      {thread.content}
                    </p>
                  </div>

                  {moderationMessage ? (
                    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${getStatusBadgeClassName(thread.status)}`}>
                      <p className="font-semibold">
                        Estado: {getForumThreadStatusLabel(thread.status)}
                      </p>
                      <p className="mt-1">{moderationMessage}</p>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors hover:bg-muted"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{thread.commentCount} comentarios</span>
                    </button>
                    <ShareThreadButton
                      path={threadPath}
                      className="flex items-center gap-1.5 rounded px-3 py-1.5 transition-colors hover:bg-muted"
                    />
                    {thread.canDelete ? (
                      <form action={softDeleteForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <input type="hidden" name="threadPath" value={threadPath} />
                        <Button type="submit" variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                          Retirar
                        </Button>
                      </form>
                    ) : null}
                    {canHardDeleteThread ? (
                      <form action={hardDeleteForumThreadAction}>
                        <input type="hidden" name="threadId" value={thread.id} />
                        <input type="hidden" name="threadPath" value={threadPath} />
                        <Button type="submit" variant="ghost" size="xs" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar definitivamente
                        </Button>
                      </form>
                    ) : null}
                  </div>

                  {canManageThread && !thread.isDeleted ? (
                    <details className="group mt-4">
                      <summary className="flex w-fit list-none items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted cursor-pointer">
                        <Pencil className="h-3.5 w-3.5" />
                        Editar publicacion
                      </summary>
                      <form
                        action={updateForumThreadAction}
                        className="mt-3 rounded-[1.5rem] border border-[#eaded7] bg-[#fcfaf7] p-4 text-sm shadow-sm dark:border-border dark:bg-muted/20"
                      >
                        <input type="hidden" name="threadId" value={thread.id} />
                        <input type="hidden" name="threadPath" value={threadPath} />
                        <div className="mb-3">
                          <p className="font-medium text-foreground">Editar publicacion</p>
                          <p className="text-xs text-muted-foreground">
                            Ajusta el titulo, el contenido y las etiquetas sin perder las respuestas del hilo.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <input
                            name="title"
                            defaultValue={thread.title}
                            minLength={12}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            required
                          />
                          <input
                            name="tags"
                            defaultValue={thread.tags.join(", ")}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            placeholder="Etiquetas separadas por coma"
                          />
                          <textarea
                            name="content"
                            defaultValue={thread.isDeleted ? "" : thread.content}
                            minLength={30}
                            className="min-h-32 w-full rounded-[1.25rem] border bg-background px-4 py-3 text-sm leading-6 resize-y focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          />
                          <div className="flex justify-end">
                            <Button type="submit" className="min-w-44 rounded-full px-6">
                              Guardar cambios
                            </Button>
                          </div>
                        </div>
                      </form>
                    </details>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              {thread.canReply ? (
                isSignedIn ? (
                  <form id="reply-form" action={createForumReplyAction} className="space-y-4">
                    <input type="hidden" name="threadId" value={thread.id} />
                    <input type="hidden" name="threadPath" value={threadPath} />
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Responder como {replyAuthorName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Aporta una solución clara, pasos concretos o experiencia directa con este equipo.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <textarea
                        name="content"
                        placeholder="Comparte tu respuesta o experiencia con esta pregunta"
                        className="min-h-32 w-full rounded-[1.5rem] border bg-background px-4 py-3 text-sm leading-6 resize-y focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      <div className="flex justify-end">
                        <Button type="submit" className="min-w-48 rounded-full px-6">
                          Responder al hilo
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Inicia sesion para responder esta pregunta y participar en la comunidad.
                    </p>
                    <Button asChild>
                      <Link href={buildForumLoginRedirectPath(threadPath)}>
                        Iniciar sesion para responder
                      </Link>
                    </Button>
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Respuestas deshabilitadas
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {replyAvailabilityMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h2 className="mb-4 font-semibold">{decoratedComments.length} comentarios</h2>

            {decoratedComments.length > 0 ? (
              <div className="space-y-1">
                {decoratedComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      threadId={thread.id}
                      threadPath={threadPath}
                      replyHref={replyHref}
                      replyLabel={replyLabel}
                    />
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aun no hay comentarios. Se el primero en compartir tu opinion.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-80">
          <ForumSidebar />
        </div>
      </div>
    </div>
  );
}