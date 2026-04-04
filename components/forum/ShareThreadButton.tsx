"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface ShareThreadButtonProps {
  path: string;
  className?: string;
}

export default function ShareThreadButton({
  path,
  className,
}: ShareThreadButtonProps) {
  const handleShare = async () => {
    try {
      const shareUrl = new URL(path, window.location.origin).toString();
      await navigator.clipboard.writeText(shareUrl);

      toast.success("Enlace copiado.", {
        description: "La pregunta ya esta lista para compartir.",
      });
    } catch {
      toast.error("No pudimos copiar el enlace.", {
        description: "Intenta nuevamente en unos segundos.",
      });
    }
  };

  return (
    <button type="button" onClick={handleShare} className={className}>
      <Share2 className="h-4 w-4" />
      <span>Compartir</span>
    </button>
  );
}