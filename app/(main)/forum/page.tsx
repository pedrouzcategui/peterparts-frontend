import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Search, Sparkles, Users } from "lucide-react";
import { BrandIcon } from "@/components/layout/BrandLogo";
import { getCurrentForumUser, getFeaturedForumTagsData, getForumFeedData, buildForumLoginRedirectPath } from "@/lib/forum";
import ForumLeftRail from "@/components/forum/ForumLeftRail";
import { Input } from "@/components/ui/input";
import ForumThreadCard from "@/components/forum/ForumThreadCard";
import ForumSidebar from "@/components/forum/ForumSidebar";
import {
  normalizeForumSort,
  slugifyForumTag,
} from "@/lib/forum-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Foro",
  description:
    "Únete al foro de la comunidad PeterParts. Haz preguntas, comparte consejos y recibe ayuda con repuestos, engranajes, batidoras y compatibilidad para KitchenAid, Cuisinart y Whirlpool.",
};

interface ForumPageProps {
  searchParams: Promise<{
    sort?: string;
    tag?: string;
  }>;
}

const sortTabs = [
  { label: "Tendencias", href: "/forum", value: "hot" },
  { label: "Nuevos", href: "/forum?sort=new", value: "new" },
  { label: "Top", href: "/forum?sort=top", value: "top" },
] as const;

export default async function ForumPage({ searchParams }: ForumPageProps) {
  const params = await searchParams;
  const activeSort = normalizeForumSort(params.sort);
  const activeTag = typeof params.tag === "string" ? params.tag : null;
  const [threads, featuredTags, currentUser] = await Promise.all([
    getForumFeedData({ sort: activeSort, tag: activeTag }),
    getFeaturedForumTagsData(6),
    getCurrentForumUser(),
  ]);
  const createThreadHref = currentUser
    ? "/forum/new"
    : buildForumLoginRedirectPath("/forum/new");

  return (
    <div className="mx-auto grid w-full max-w-[1580px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
      <div className="hidden xl:block xl:pt-10">
        <div className="sticky top-28">
          <ForumLeftRail
            activeSort={activeSort}
            activeTag={activeTag}
          />
        </div>
      </div>

      <div className="min-w-0">
        <div className="mx-auto flex max-w-[820px] flex-col gap-4">
          <section className="overflow-hidden rounded-[30px] border border-border/70 bg-card shadow-sm">
            <div className="h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.35),transparent_40%),linear-gradient(135deg,#d91e36_0%,#78111f_100%)]" />

            <div className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="-mt-10 mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="flex h-18 w-18 items-center justify-center rounded-[24px] border-4 border-card bg-white p-3 shadow-sm dark:bg-[#1A1714]">
                    <BrandIcon className="h-full w-full" sizes="72px" priority />
                  </div>
                  <div className="pb-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
                      r/peterparts
                    </p>
                    <h1 className="mt-12 text-3xl font-bold tracking-tight text-foreground sm:mt-16 sm:text-4xl">
                      Foro de la comunidad
                    </h1>
                  </div>
                </div>

                <Link
                  href={createThreadHref}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {currentUser ? "Crear hilo" : "Inicia sesion para preguntar"}
                </Link>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Haz preguntas, comparte consejos y encuentra respuestas practicas sobre mantenimiento, reparacion, compatibilidad de repuestos y fallas comunes en batidoras y mezcladoras.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>2.4k miembros</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span>{threads.length} conversaciones activas</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-sm text-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Soporte experto y experiencias reales</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-border/70 bg-card p-4 shadow-sm sm:p-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar fallas, modelos, engranajes, repuestos o consejos en el foro"
                className="h-13 rounded-full border-transparent bg-muted pl-12 pr-4 shadow-none focus-visible:border-primary/20"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sortTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                    activeSort === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {featuredTags.map((tag) => {
                const tagSlug = slugifyForumTag(tag);

                return (
                  <Link
                    key={tag}
                    href={`/forum?tag=${tagSlug}`}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      activeTag === tagSlug
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border/70 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    )}
                  >
                    {tag}
                  </Link>
                );
              })}

              {activeTag ? (
                <Link
                  href={activeSort === "hot" ? "/forum" : `/forum?sort=${activeSort}`}
                  className="inline-flex items-center rounded-full border border-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Limpiar filtro
                </Link>
              ) : null}
            </div>
          </section>

          <div className="space-y-4">
            {threads.map((thread) => (
              <ForumThreadCard
                key={thread.id}
                thread={thread}
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Cargar más hilos
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 lg:pt-10">
        <div className="lg:sticky lg:top-28">
          <ForumSidebar
            activeSort={activeSort}
            activeTag={activeTag}
          />
        </div>
      </div>
    </div>
  );
}
