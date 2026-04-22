import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FooterInfoPageSection {
  title: string;
  description: string;
}

interface FooterInfoPageAction {
  label: string;
  href: string;
}

interface FooterInfoPageProps {
  eyebrow: string;
  title: string;
  description: string;
  asideTitle: string;
  asideItems: string[];
  sections: FooterInfoPageSection[];
  ctaTitle: string;
  ctaDescription: string;
  primaryAction: FooterInfoPageAction;
  secondaryAction?: FooterInfoPageAction;
  children?: ReactNode;
}

export default function FooterInfoPage({
  eyebrow,
  title,
  description,
  asideTitle,
  asideItems,
  sections,
  ctaTitle,
  ctaDescription,
  primaryAction,
  secondaryAction,
  children,
}: FooterInfoPageProps) {
  return (
    <div className="site-shell py-10 sm:py-12 lg:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-[#ebe7e0] bg-[linear-gradient(135deg,#d91e36_0%,#630e19_100%)] text-white shadow-[0_24px_64px_rgba(26,23,20,0.08)] dark:border-border dark:shadow-none">
        <div className="grid gap-8 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/86 sm:text-base">
              {description}
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/72">
              {asideTitle}
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/88">
              {asideItems.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <article
            key={section.title}
            className="rounded-[1.5rem] border border-[#ebe7e0] bg-white p-5 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none"
          >
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              {section.description}
            </p>
          </article>
        ))}
      </section>

      {children ? <div className="mt-8 space-y-8">{children}</div> : null}

      <section className="mt-8 rounded-[2rem] border border-[#ebe7e0] bg-white p-6 shadow-[0_18px_48px_rgba(26,23,20,0.06)] dark:border-border dark:bg-card dark:shadow-none sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Siguiente paso
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1714] dark:text-foreground">
              {ctaTitle}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {ctaDescription}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {secondaryAction ? (
              <Button asChild variant="outline" size="lg">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}