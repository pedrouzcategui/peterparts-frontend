import Link from "next/link";
import {
  ArrowUpRight,
  Bolt,
  CircleHelp,
  Clock,
  Flame,
  PenSquare,
  TrendingUp,
} from "lucide-react";
import {
  buildForumLoginRedirectPath,
  buildForumThreadPath,
  getCurrentForumUser,
  getFeaturedForumTagsData,
  getRecentForumThreads,
} from "@/lib/forum";
import { BrandIcon } from "@/components/layout/BrandLogo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  formatRelativeTime,
  slugifyForumTag,
  type ForumSort,
} from "@/lib/forum-data";
import { cn } from "@/lib/utils";

interface ForumSidebarProps {
  activeSort?: ForumSort;
  activeTag?: string | null;
}

const exploreLinks = [
  {
    href: "/forum",
    label: "Tendencias",
    icon: Flame,
    isActive: (activeSort: ForumSort) => activeSort === "hot",
  },
  {
    href: "/forum?sort=new",
    label: "Nuevos",
    icon: Clock,
    isActive: (activeSort: ForumSort) => activeSort === "new",
  },
  {
    href: "/forum?sort=top",
    label: "Top",
    icon: TrendingUp,
    isActive: (activeSort: ForumSort) => activeSort === "top",
  },
];

/**
 * ForumSidebar — Server Component
 * Shows recent publications and quick actions
 */
export default async function ForumSidebar({
  activeSort = "hot",
  activeTag = null,
}: ForumSidebarProps) {
  const [popularTags, currentUser, recentThreads] = await Promise.all([
    getFeaturedForumTagsData(8),
    getCurrentForumUser(),
    getRecentForumThreads(4),
  ]);
  const createThreadHref = currentUser
    ? "/forum/new"
    : buildForumLoginRedirectPath("/forum/new");

  return (
    <aside className="space-y-5">
      <Card className="gap-0 overflow-hidden rounded-[28px] border-border/70 py-0 shadow-sm">
        <div className="h-20 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.25),transparent_42%),linear-gradient(135deg,#d91e36_0%,#8c1324_100%)]" />
        <CardContent className="p-6">
          <div className="-mt-12 mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] border-4 border-card bg-white p-2.5 shadow-sm dark:bg-[#1A1714]">
            <BrandIcon className="h-full w-full" sizes="64px" />
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              r/PeterParts
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              Comunidad de soporte
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Diagnósticos rápidos, mantenimiento preventivo y recomendaciones de repuestos para cocina y lavandería.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg font-semibold text-foreground">2.4k</p>
              <p className="text-xs text-muted-foreground">Miembros</p>
            </div>
            <div className="rounded-2xl bg-muted p-4">
              <p className="text-lg font-semibold text-foreground">156</p>
              <p className="text-xs text-muted-foreground">En línea</p>
            </div>
          </div>

          <Button
            asChild
            variant="secondary"
            className="mt-5 h-11 w-full rounded-full"
          >
            <Link href={createThreadHref}>
              <PenSquare className="mr-2 h-4 w-4" />
              {currentUser ? "Crear hilo" : "Inicia sesion para participar"}
            </Link>
          </Button>

          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 px-3 py-3">
              <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Explica el modelo exacto y los síntomas antes de pedir ayuda.</span>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-muted/50 px-3 py-3">
              <Bolt className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>Las respuestas priorizan pasos concretos, seguridad y compatibilidad.</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 py-0 shadow-sm">
        <CardHeader className="px-5 pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Explorar</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <nav className="space-y-2">
            {exploreLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive(activeSort);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-14 items-center justify-between gap-3 rounded-[22px] px-4 py-3 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl transition-colors",
                        isActive
                          ? "bg-white/14 text-primary-foreground"
                          : "bg-muted text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-70" />
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 py-0 shadow-sm">
        <CardHeader className="px-5 pb-3 pt-5">
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
        <CardContent className="px-4 pb-4 pt-0">
          <div className="space-y-2">
            {recentThreads.length === 0 ? (
              <p className="rounded-2xl bg-muted/50 px-3 py-4 text-sm text-muted-foreground">
                Todavia no hay publicaciones recientes en el foro.
              </p>
            ) : null}
            {recentThreads.map((thread, index) => (
              <div key={thread.id}>
                <Link
                  href={buildForumThreadPath(thread)}
                  className="group block rounded-[22px] px-3 py-3 transition-colors hover:bg-muted/60"
                >
                  <p className="line-clamp-2 text-sm group-hover:text-primary transition-colors">
                    {thread.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeTime(thread.createdAt)}
                  </p>
                </Link>
                {index < recentThreads.length - 1 && (
                  <Separator className="my-0.5" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 py-0 shadow-sm">
        <CardHeader className="px-5 pb-3 pt-5">
          <CardTitle className="text-sm font-medium">Etiquetas populares</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <div className="flex flex-wrap gap-2.5">
            {popularTags.map((tag) => (
              <Link
                key={tag}
                href={`/forum?tag=${slugifyForumTag(tag)}`}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  activeTag === slugifyForumTag(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-primary/10 hover:text-primary"
                )}
              >
                {tag}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] border-border/70 py-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Atajos útiles</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Link
            href="/products"
            className="flex items-center justify-between rounded-2xl bg-muted px-3 py-3 text-sm font-medium transition-colors hover:bg-muted/80"
          >
            <span>Explorar catálogo de repuestos</span>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
