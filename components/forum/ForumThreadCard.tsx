import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ShareThreadButton from "@/components/forum/ShareThreadButton";
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
  const threadPath = `/forum/${thread.slug ?? thread.id}`;

  return (
    <Card className="overflow-hidden rounded-[28px] border-border/70 py-0 shadow-sm transition-all hover:border-primary/20 hover:shadow-md">
      <div className="flex min-w-0">
        <div className="flex w-15 shrink-0 items-start justify-center border-r border-border/70 bg-muted/55 px-2 py-4">
          <VoteButtons
            entityType="thread"
            entityId={thread.id}
            initialUpvotes={thread.upvotes}
            initialDownvotes={thread.downvotes}
            initialVoteState={thread.currentUserVote ?? null}
            orientation="vertical"
            size="sm"
          />
        </div>

        <CardContent className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-foreground">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {thread.author.initials}
              </div>
              <span className="font-semibold">Comunidad Peter Parts</span>
            </div>
            <span>Publicado por {thread.author.name}</span>
            <span>•</span>
            <span>{formatRelativeTime(thread.createdAt)}</span>
            {thread.isEdited ? (
              <>
                <span>•</span>
                <span>Editado</span>
              </>
            ) : null}
          </div>

          <Link
            href={threadPath}
            className="group block"
          >
            <h3 className="mb-2 text-lg leading-tight font-semibold text-foreground transition-colors group-hover:text-primary sm:text-xl">
              {thread.title}
            </h3>
          </Link>

          <p className={`mb-4 line-clamp-3 text-sm leading-6 text-muted-foreground ${thread.isDeleted ? "italic" : ""}`}>
            {thread.content}
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full border border-transparent px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/20 hover:text-foreground"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Link
              href={threadPath}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{thread.commentCount} comentarios</span>
            </Link>
            <ShareThreadButton
              path={threadPath}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
            />
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
