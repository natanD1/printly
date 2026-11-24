import { PackageOpen, Store } from "lucide-react";
import { PublicShowcaseCard } from "@/components/public-showcase-card";
import { PublicShowcaseContacts } from "@/components/public-showcase-contacts";
import { PublicShowcaseFooter } from "@/components/public-showcase-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PublicShowcase } from "@/types/showcase";

type AvailablePublicShowcase = Extract<PublicShowcase, { available: true }>;

interface PublicShowcaseViewProps {
  showcase: AvailablePublicShowcase;
  slug: string;
}

function formatProductCount(count: number): string {
  return count === 1 ? "1 produto" : `${count} produtos`;
}

export function PublicShowcaseView({
  showcase,
  slug,
}: PublicShowcaseViewProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center gap-4 pt-2 text-center sm:flex-row sm:gap-5 sm:pt-0 sm:pr-12 sm:text-left">
            {showcase.hasLogo ? (
              // biome-ignore lint/performance/noImgElement: logo dinâmico servido pelo route handler público
              <img
                alt={showcase.storeName}
                className="size-20 shrink-0 rounded-2xl border bg-background object-contain p-2 shadow-xs sm:size-24"
                height={96}
                src={`/api/public/loja/${slug}/logo`}
                width={96}
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-20"
              >
                <Store className="size-7 sm:size-8" />
              </div>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                Vitrine de produtos
              </span>
              <h1 className="text-balance font-bold font-heading text-2xl text-foreground tracking-tight sm:text-3xl">
                {showcase.storeName}
              </h1>
            </div>
          </div>

          <PublicShowcaseContacts contacts={showcase.contacts} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        {showcase.items.length > 0 ? (
          <section aria-label="Produtos" className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-heading font-semibold text-base text-foreground sm:text-lg">
                Produtos
              </h2>
              <span className="text-muted-foreground text-xs sm:text-sm">
                {formatProductCount(showcase.items.length)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {showcase.items.map((item) => (
                <PublicShowcaseCard
                  item={item}
                  key={item.productId}
                  slug={slug}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/60 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <PackageOpen aria-hidden="true" className="size-7" />
            </div>
            <h2 className="mt-4 font-heading font-semibold text-foreground text-lg">
              Nenhum produto por aqui ainda
            </h2>
            <p className="mt-2 max-w-sm text-muted-foreground text-sm leading-relaxed">
              Esta loja ainda está organizando os produtos da vitrine. Volte em
              breve para conferir as novidades.
            </p>
          </section>
        )}
      </main>

      {showcase.showBranding ? <PublicShowcaseFooter /> : null}
    </div>
  );
}
