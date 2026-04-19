import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, PenSquare } from "lucide-react";
import { createForumThreadAction } from "@/app/(main)/forum/actions";
import ForumTagInput from "@/components/forum/ForumTagInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentForumUser, buildForumLoginRedirectPath, getFeaturedForumTagsData } from "@/lib/forum";

export default async function NewForumThreadPage() {
  const [currentUser, existingTags] = await Promise.all([
    getCurrentForumUser(),
    getFeaturedForumTagsData(12),
  ]);
  const authorName = currentUser?.name ?? "Tu cuenta";

  if (!currentUser) {
    redirect(buildForumLoginRedirectPath("/forum/new"));
  }

  return (
    <div className="site-shell py-8 sm:py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <Button asChild variant="ghost" className="-ml-3 w-fit">
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4" />
            Volver al foro
          </Link>
        </Button>

        <Card className="overflow-hidden rounded-[2rem] border-[#ebe7e0] py-0 shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:shadow-none">
          <div className="bg-[linear-gradient(135deg,#d91e36_0%,#630e19_100%)] px-6 py-8 text-white sm:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
                <PenSquare className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                  Nueva pregunta
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Publica tu consulta en el foro
                </h1>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Estas publicando como {authorName}. Explica el modelo, el sintoma y lo que ya intentaste. Un administrador revisara la publicacion antes de que aparezca en el foro publico.
                </p>
              </div>
            </div>
          </div>

          <CardHeader>
            <CardTitle>Detalles de la pregunta</CardTitle>
            <CardDescription>
              Mientras mas contexto compartas, mas facil sera aprobar la pregunta y obtener una respuesta util de la comunidad.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8 sm:pb-10">
            <form action={createForumThreadAction} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Titulo
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  minLength={12}
                  placeholder="Describe el problema o la duda principal"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs transition-shadow outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="tags" className="text-sm font-medium text-foreground">
                  Etiquetas
                </label>
                <ForumTagInput
                  id="tags"
                  name="tags"
                  suggestions={existingTags}
                  placeholder="Ej: KitchenAid, repuestos, batidora"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-foreground">
                  Pregunta
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  minLength={30}
                  placeholder="Explica el modelo exacto, los sintomas, el tiempo de uso y cualquier prueba que ya hiciste"
                  className="min-h-44 w-full rounded-2xl border border-input bg-background px-3 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button asChild variant="outline">
                  <Link href="/forum">Cancelar</Link>
                </Button>
                <Button type="submit">Enviar a revision</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}