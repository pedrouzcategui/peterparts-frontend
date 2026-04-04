import Link from "next/link";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { softDeleteForumReplyAction, updateForumReplyAction } from "@/app/(main)/forum/actions";
import { Button } from "@/components/ui/button";
import VoteButtons from "./VoteButtons";
import type { ForumComment } from "@/lib/forum-data";
import { formatRelativeTime } from "@/lib/forum-data";

interface CommentItemProps {
  comment: ForumComment;
  threadIdOrSlug: string;
  depth?: number;
  canReply?: boolean;
  replyHref?: string;
}

/**
 * CommentItem — Renders a single comment with nested replies
 */
export default function CommentItem({
  comment,
  threadIdOrSlug,
  depth = 0,
  canReply = false,
  replyHref = "#reply-form",
}: CommentItemProps) {
  const maxDepth = 3;
  const showNestedReplies = depth < maxDepth;
  const canManageComment = Boolean(comment.canEdit || comment.canDelete);
  const isDeleted = Boolean(comment.isDeleted);
  const commentContainerClassName = depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : "";

  return (
    <div
      id={`comment-${comment.id}`}
      className={commentContainerClassName}
    >
      <div className="py-3">
        {/* Comment header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
              {comment.author.initials}
            </span>
          </div>
          <span className="text-sm font-medium">{comment.author.name}</span>
          <span className="text-xs text-muted-foreground">
            • {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Comment content */}
        <p className={`text-sm mb-2 pl-8 ${isDeleted ? "italic text-muted-foreground" : ""}`}>
          {comment.content}
        </p>

        {/* Comment actions */}
        <div className="flex flex-wrap items-center gap-2 pl-8 text-xs text-muted-foreground">
          <VoteButtons
            entityType="reply"
            entityId={comment.id}
            initialUpvotes={comment.upvotes}
            initialDownvotes={comment.downvotes}
            initialVoteState={comment.currentUserVote ?? null}
            orientation="horizontal"
            size="sm"
          />
          <Link
            href={replyHref}
            className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {canReply ? "Responder" : "Inicia sesion para responder"}
          </Link>
          {comment.canDelete && !isDeleted ? (
            <form action={softDeleteForumReplyAction}>
              <input type="hidden" name="replyId" value={comment.id} />
              <input type="hidden" name="threadIdOrSlug" value={threadIdOrSlug} />
              <Button type="submit" variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </form>
          ) : null}
        </div>

        {canManageComment && !isDeleted ? (
          <details className="group mt-3 pl-8">
            <summary className="flex w-fit list-none items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </summary>
            <form
              action={updateForumReplyAction}
              className="mt-3 rounded-[1.5rem] border border-[#eaded7] bg-[#fcfaf7] p-4 text-sm shadow-sm dark:border-border dark:bg-muted/20"
            >
              <input type="hidden" name="replyId" value={comment.id} />
              <input type="hidden" name="threadIdOrSlug" value={threadIdOrSlug} />
              <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">Editar respuesta</p>
                  <p className="text-xs text-muted-foreground">
                    Ajusta el texto y guarda los cambios sin perder el contexto del hilo.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <textarea
                  name="content"
                  defaultValue={comment.content}
                  className="min-h-28 w-full rounded-[1.25rem] border bg-background px-4 py-3 text-sm leading-6 resize-y focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="min-w-40 rounded-full px-5">
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </form>
          </details>
        ) : null}
      </div>

      {/* Nested replies */}
      {showNestedReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              threadIdOrSlug={threadIdOrSlug}
              depth={depth + 1}
              canReply={canReply}
              replyHref={replyHref}
            />
          ))}
        </div>
      )}
    </div>
  );
}
