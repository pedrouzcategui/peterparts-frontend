"use client";

import { useEffect, useState, useTransition } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ForumVoteState } from "@/lib/forum-data";

interface VoteButtonsProps {
  entityType: "thread" | "reply";
  entityId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialVoteState?: ForumVoteState;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

interface VoteApiResponse {
  upvotes: number;
  downvotes: number;
  currentUserVote: ForumVoteState;
  redirectTo?: string;
  message?: string;
}

/**
 * VoteButtons — Client Component
 * Handles upvoting and downvoting with visual feedback.
 * The actual vote count is just for UI demonstration.
 */
export default function VoteButtons({
  entityType,
  entityId,
  initialUpvotes,
  initialDownvotes,
  initialVoteState = null,
  orientation = "vertical",
  size = "md",
}: VoteButtonsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [voteState, setVoteState] = useState<ForumVoteState>(initialVoteState);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);

  useEffect(() => {
    setVoteState(initialVoteState);
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
  }, [initialDownvotes, initialUpvotes, initialVoteState]);

  const score = upvotes - downvotes;

  const submitVote = (direction: Exclude<ForumVoteState, null>) => {
    startTransition(async () => {
      const response = await fetch("/api/forum/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entityType,
          entityId,
          direction,
        }),
      });

      const data = (await response.json().catch(() => null)) as VoteApiResponse | null;

      if (response.status === 401 && data?.redirectTo) {
        router.push(data.redirectTo);
        return;
      }

      if (!response.ok || !data) {
        return;
      }

      setVoteState(data.currentUserVote);
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      router.refresh();
    });
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const buttonSize = size === "sm" ? "p-1" : "p-1.5";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row"
      )}
    >
      <button
        type="button"
        onClick={() => submitVote("up")}
        disabled={isPending}
        className={cn(
          "rounded transition-colors hover:bg-muted",
          buttonSize,
          isPending && "cursor-not-allowed opacity-70",
          voteState === "up" && "text-red-500"
        )}
        aria-label="Voto positivo"
        aria-pressed={voteState === "up"}
      >
        <ChevronUp className={iconSize} />
      </button>
      <span
        className={cn(
          "font-semibold tabular-nums",
          size === "sm" ? "text-xs" : "text-sm",
          voteState === "up" && "text-red-500",
          voteState === "down" && "text-blue-500"
        )}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => submitVote("down")}
        disabled={isPending}
        className={cn(
          "rounded transition-colors hover:bg-muted",
          buttonSize,
          isPending && "cursor-not-allowed opacity-70",
          voteState === "down" && "text-blue-500"
        )}
        aria-label="Voto negativo"
        aria-pressed={voteState === "down"}
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
