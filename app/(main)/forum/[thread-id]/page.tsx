import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, Share2, Bookmark, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import VoteButtons from "@/components/forum/VoteButtons";
import CommentItem from "@/components/forum/CommentItem";
import ForumSidebar from "@/components/forum/ForumSidebar";
import { getThreadById, formatRelativeTime } from "@/lib/forum-data";

interface ThreadPageProps {
  params: Promise<{ "thread-id": string }>;
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const { "thread-id": threadId } = await params;
  const thread = getThreadById(threadId);

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
  const thread = getThreadById(threadId);

  if (!thread) {
    notFound();
  }

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
                  initialUpvotes={thread.upvotes}
                  initialDownvotes={thread.downvotes}
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
                    <p>{thread.content}</p>
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
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartir</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:bg-muted px-3 py-1.5 rounded transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Reportar</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comment input */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Comentar como{" "}
                <span className="font-medium text-foreground">Usuario invitado</span>
              </p>
              <textarea
                placeholder="¿Que opinas?"
                className="w-full min-h-25 rounded-lg border bg-background p-3 resize-none focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end mt-2">
                <Button>Comentar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments section */}
          <div>
            <h2 className="font-semibold mb-4">
              {thread.comments.length} comentarios
            </h2>

            {thread.comments.length > 0 ? (
              <div className="space-y-1">
                {thread.comments.map((comment) => (
                  <div key={comment.id}>
                    <CommentItem comment={comment} />
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
