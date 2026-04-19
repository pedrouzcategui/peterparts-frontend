"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminForumHeaderModerationSummary } from "@/lib/forum";
import { cn } from "@/lib/utils";

interface AdminModerationMenuProps {
  moderationSummary: AdminForumHeaderModerationSummary;
}

const pendingDateFormatter = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatPendingCount(count: number): string {
  if (count > 99) {
    return "99+";
  }

  return String(count);
}

export function AdminModerationMenu({
  moderationSummary,
}: AdminModerationMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Publicaciones pendientes por aprobar"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative"
        onClick={() => setOpen((currentValue) => !currentValue)}
      >
        <MessageSquare className="h-5 w-5" />
        {moderationSummary.pendingCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-5 text-white">
            {formatPendingCount(moderationSummary.pendingCount)}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[22rem] rounded-2xl border border-border/70 bg-background p-4 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Moderacion del foro</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {moderationSummary.pendingCount > 0
                  ? `${moderationSummary.pendingCount} publicaciones esperan aprobacion.`
                  : "No hay publicaciones pendientes ahora mismo."}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cerrar panel de moderacion"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {moderationSummary.recentPendingThreads.length > 0 ? (
              moderationSummary.recentPendingThreads.map((thread) => (
                <Link
                  key={thread.id}
                  href={thread.path}
                  className="block rounded-xl border border-transparent bg-muted/35 px-3 py-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  onClick={() => setOpen(false)}
                >
                  <p className="line-clamp-2 text-sm font-medium text-foreground">
                    {thread.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {thread.authorName} · {pendingDateFormatter.format(new Date(thread.createdAt))}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border/70 px-3 py-8 text-center text-sm text-muted-foreground">
                La cola de aprobacion esta al dia.
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3">
            <p
              className={cn(
                "text-xs text-muted-foreground",
                moderationSummary.pendingCount > 0 && "text-foreground",
              )}
            >
              {moderationSummary.pendingCount > 0
                ? "Abre la moderacion completa para aprobar, rechazar o eliminar publicaciones."
                : "Puedes revisar el historial reciente desde la moderacion completa."}
            </p>
            <Button asChild size="sm">
              <Link href="/admin/forum" onClick={() => setOpen(false)}>
                Ver moderacion
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}