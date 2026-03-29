import Link from "next/link";
import { Clock, PenSquare, Flame, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { mockRecentPublications, formatRelativeTime } from "@/lib/forum-data";

/**
 * ForumSidebar — Server Component
 * Shows recent publications and quick actions
 */
export default function ForumSidebar() {
  return (
    <aside className="space-y-4">
      {/* Create Thread CTA */}
      <Card className="border-0 bg-linear-to-br from-[#d91e36] to-[#630e19] text-white">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">¿Tienes una pregunta?</h3>
          <p className="text-sm text-red-100 mb-3">
            Pide ayuda a la comunidad de PeterParts con tus electrodomesticos.
          </p>
          <Button
            variant="secondary"
            className="w-full"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Crear hilo
          </Button>
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Explorar</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <nav className="space-y-1">
            <Link
              href="/forum"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-red-500 text-white"
            >
              <Flame className="h-4 w-4" />
              Tendencias
            </Link>
            <Link
              href="/forum?sort=new"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <Clock className="h-4 w-4" />
              Nuevos
            </Link>
            <Link
              href="/forum?sort=top"
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Top
            </Link>
          </nav>
        </CardContent>
      </Card>

      {/* Recent Publications */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              Publicaciones recientes
            </CardTitle>
            <button
              type="button"
              className="text-xs text-red-500 hover:underline"
            >
              Limpiar
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {mockRecentPublications.map((pub, index) => (
              <div key={pub.id}>
                <Link
                  href={`/forum/${pub.threadId}`}
                  className="block py-2 group"
                >
                  <p className="text-sm line-clamp-2 group-hover:text-red-500 transition-colors">
                    {pub.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatRelativeTime(pub.visitedAt)}
                  </p>
                </Link>
                {index < mockRecentPublications.length - 1 && (
                  <Separator className="my-1" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Etiquetas populares</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex flex-wrap gap-2">
            {[
              "KitchenAid",
              "Whirlpool",
              "Samsung",
              "Reparacion",
              "Repuestos",
              "DIY",
              "Refrigerador",
              "Horno",
            ].map((tag) => (
              <Link
                key={tag}
                href={`/forum?tag=${tag.toLowerCase()}`}
                className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Sobre el foro de PeterParts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            Una comunidad para compartir consejos, hacer preguntas y ayudarse con reparaciones y mantenimiento.
          </p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-lg font-bold">2.4k</p>
              <p className="text-xs text-muted-foreground">Miembros</p>
            </div>
            <div className="p-2 rounded-lg bg-muted">
              <p className="text-lg font-bold">156</p>
              <p className="text-xs text-muted-foreground">En linea</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
