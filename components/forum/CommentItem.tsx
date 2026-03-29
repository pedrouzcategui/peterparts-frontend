import { MessageSquare } from "lucide-react";
import VoteButtons from "./VoteButtons";
import type { ForumComment } from "@/lib/forum-data";
import { formatRelativeTime } from "@/lib/forum-data";

interface CommentItemProps {
  comment: ForumComment;
  depth?: number;
}

/**
 * CommentItem — Renders a single comment with nested replies
 */
export default function CommentItem({ comment, depth = 0 }: CommentItemProps) {
  const maxDepth = 3;
  const showNestedReplies = depth < maxDepth;

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-muted pl-4" : ""}>
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
        <p className="text-sm mb-2 pl-8">{comment.content}</p>

        {/* Comment actions */}
        <div className="flex items-center gap-3 pl-8 text-xs text-muted-foreground">
          <VoteButtons
            initialUpvotes={comment.upvotes}
            initialDownvotes={comment.downvotes}
            orientation="horizontal"
            size="sm"
          />
          <button
            type="button"
            className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Responder
          </button>
        </div>
      </div>

      {/* Nested replies */}
      {showNestedReplies && comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
