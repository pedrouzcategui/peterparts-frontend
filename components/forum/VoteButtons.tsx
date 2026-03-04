"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  initialUpvotes: number;
  initialDownvotes: number;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md";
}

type VoteState = "up" | "down" | null;

/**
 * VoteButtons — Client Component
 * Handles upvoting and downvoting with visual feedback.
 * The actual vote count is just for UI demonstration.
 */
export default function VoteButtons({
  initialUpvotes,
  initialDownvotes,
  orientation = "vertical",
  size = "md",
}: VoteButtonsProps) {
  const [voteState, setVoteState] = useState<VoteState>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);

  const score = upvotes - downvotes;

  const handleUpvote = () => {
    if (voteState === "up") {
      // Remove upvote
      setVoteState(null);
      setUpvotes((prev) => prev - 1);
    } else if (voteState === "down") {
      // Switch from downvote to upvote
      setVoteState("up");
      setUpvotes((prev) => prev + 1);
      setDownvotes((prev) => prev - 1);
    } else {
      // Add upvote
      setVoteState("up");
      setUpvotes((prev) => prev + 1);
    }
  };

  const handleDownvote = () => {
    if (voteState === "down") {
      // Remove downvote
      setVoteState(null);
      setDownvotes((prev) => prev - 1);
    } else if (voteState === "up") {
      // Switch from upvote to downvote
      setVoteState("down");
      setDownvotes((prev) => prev + 1);
      setUpvotes((prev) => prev - 1);
    } else {
      // Add downvote
      setVoteState("down");
      setDownvotes((prev) => prev + 1);
    }
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
        onClick={handleUpvote}
        className={cn(
          "rounded transition-colors hover:bg-muted",
          buttonSize,
          voteState === "up" && "text-red-500"
        )}
        aria-label="Upvote"
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
        onClick={handleDownvote}
        className={cn(
          "rounded transition-colors hover:bg-muted",
          buttonSize,
          voteState === "down" && "text-blue-500"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={iconSize} />
      </button>
    </div>
  );
}
