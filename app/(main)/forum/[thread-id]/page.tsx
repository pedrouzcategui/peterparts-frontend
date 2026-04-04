import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { buildForumLoginRedirectPath, getCurrentForumUser, getForumThreadData } from "@/lib/forum";
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
import { formatRelativeTime } from "@/lib/forum-data";

interface ThreadPageProps {
  params: Promise<{ "thread-id": string }>;
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
  const { "thread-id": threadId } = await params;
  const [thread, currentUser] = await Promise.all([
    getForumThreadData(threadId),
    getCurrentForumUser(),
  ]);

  if (!thread) {
    notFound();
  }

  const isSignedIn = Boolean(currentUser);
  const replyAuthorName = currentUser?.name ?? "Tu cuenta";
  const replyHref = isSignedIn
    ? "#reply-form"
    : buildForumLoginRedirectPath(`/forum/${thread.slug ?? thread.id}`);
  const threadPath = `/forum/${thread.slug ?? thread.id}`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al foro
      </Link>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Thread card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Vote buttons */}
                <VoteButtons
                  entityType="thread"
                  entityId={thread.id}
                  initialUpvotes={thread.upvotes}
                  initialDownvotes={thread.downvotes}
                  initialVoteState={thread.currentUserVote ?? null}
                  orientation="vertical"
                />

                {/* Thread content */}
                <div className="flex-1 min-w-0">
                  {/* Author and time */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
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

                  {/* Title */}
                  <h1 className="text-xl font-bold mb-4">{thread.title}</h1>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
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

                  {/* Content */}
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                    <p className={thread.isDeleted ? "italic text-muted-foreground" : undefined}>
                      {thread.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{thread.commentCount} comentarios</span>
                    </button>
                    <ShareThreadButton
                      path={threadPath}
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    />
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Reportar</span>
                    </button>
                    {thread.canDelete ? (
                      <form action={softDeleteForumThreadAction}>
                        <input type="hidden" name="threadIdOrSlug" value={thread.slug ?? thread.id} />
                        <Button type="submit" variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                          Retirar
                        </Button>
                      </form>
                    ) : null}
                    {canHardDeleteThread ? (
                      <form action={hardDeleteForumThreadAction}>
                        <input type="hidden" name="threadIdOrSlug" value={thread.slug ?? thread.id} />
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
                        <input type="hidden" name="threadIdOrSlug" value={thread.slug ?? thread.id} />
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

          {/* Comment input */}
          <Card className="mb-6">
            <CardContent className="p-5 sm:p-6">
              {isSignedIn ? (
                <form id="reply-form" action={createForumReplyAction} className="space-y-4">
                  <input type="hidden" name="threadIdOrSlug" value={thread.slug ?? thread.id} />
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
                    <Link href={replyHref}>Iniciar sesion para responder</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments section */}
          <div>
            <h2 className="font-semibold mb-4">
              {decoratedComments.length} comentarios
            </h2>

            {decoratedComments.length > 0 ? (
              <div className="space-y-1">
                {decoratedComments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem
                      comment={comment}
                      threadIdOrSlug={thread.slug ?? thread.id}
                      canReply={isSignedIn}
                      replyHref={replyHref}
                    />
                    <Separator className="my-2" />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Aun no hay comentarios. Se el primero en compartir tu opinion.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 shrink-0">
          <ForumSidebar />
        </div>
      </div>
    </div>
  );
}
