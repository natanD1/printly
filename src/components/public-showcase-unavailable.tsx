import { Store } from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicShowcaseUnavailable() {
  return (
    <div className="relative flex min-h-svh flex-col justify-center bg-background text-foreground">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <main className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-12 text-center">
        <div className="mb-10 flex items-center">
          <Image
            alt="Printly"
            className="h-7 w-auto dark:hidden"
            height={256}
            priority
            src="/printly-logo-horizontal.svg"
            width={916}
          />
          <Image
            alt="Printly"
            className="hidden h-7 w-auto dark:block"
            height={256}
            priority
            src="/printly-logo-horizontal-negativo.svg"
            width={916}
          />
        </div>

        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Store aria-hidden="true" className="size-8" />
        </div>

        <h1 className="mt-6 font-bold font-heading text-2xl tracking-tight sm:text-3xl">
          Vitrine indisponível
        </h1>

        <p className="mt-3 max-w-md text-base text-muted-foreground leading-relaxed">
          Esta vitrine não está disponível no momento. Ela pode estar
          temporariamente pausada pelo responsável.
        </p>

        <p className="mt-6 max-w-sm text-muted-foreground text-sm">
          Se você recebeu este link recentemente, tente novamente mais tarde ou
          fale diretamente com a loja.
        </p>
      </main>
    </div>
  );
}
