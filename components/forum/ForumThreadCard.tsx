import Link from "next/link";
import { MessageSquare, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import VoteButtons from "./VoteButtons";
import type { ForumThread } from "@/lib/forum-data";
import { formatRelativeTime } from "@/lib/forum-data";

interface ForumThreadCardProps {
  thread: ForumThread;
}

/**
 * ForumThreadCard — Displays a thread preview in the forum list
 * Similar to Reddit post cards
 */
export default function ForumThreadCard({ thread }: ForumThreadCardProps) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Vote buttons */}
          <VoteButtons
            initialUpvotes={thread.upvotes}
            initialDownvotes={thread.downvotes}
            orientation="vertical"
          />

          {/* Thread content */}
          <div className="flex-1 min-w-0">
            {/* Author and time */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
                    {thread.author.initials}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {thread.author.name}
                </span>
              </div>
              <span>•</span>
              <span>{formatRelativeTime(thread.createdAt)}</span>
            </div>

            {/* Title */}
            <Link
              href={`/forum/${thread.id}`}
              className="block group"
            >
              <h3 className="font-semibold text-base mb-2 group-hover:text-red-500 transition-colors line-clamp-2">
                {thread.title}
              </h3>
            </Link>

            {/* Preview content */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {thread.content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
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

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link
                href={`/forum/${thread.id}`}
                className="flex items-center gap-1.5 hover:bg-muted px-2 py-1 rounded transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{thread.commentCount} comments</span>
              </Link>
              <button
                type="button"
                className="flex items-center gap-1.5 hover:bg-muted px-2 py-1 rounded transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
