import Link from "next/link";
import { MessageSquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThreadNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <MessageSquareOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Hilo no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          El hilo que buscas no existe o fue eliminado.
        </p>
        <Button asChild>
          <Link href="/forum">Volver al foro</Link>
        </Button>
      </div>
    </div>
  );
}
