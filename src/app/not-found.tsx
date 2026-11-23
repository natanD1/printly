import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404 — Página não encontrada | Printly",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col justify-center">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <main className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex items-center justify-center">
          <Image
            alt="Cachorro astronauta flutuando no espaço"
            className="h-auto w-full max-w-md select-none sm:max-w-lg lg:max-w-[580px]"
            height={500}
            priority
            src="/404_dog.svg"
            width={500}
          />
        </div>

        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Link
            aria-label="Ir para o início"
            className="mb-10 inline-flex cursor-pointer items-center"
            href="/home"
          >
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
          </Link>

          <p className="font-bold font-mono text-7xl text-primary leading-none tracking-tight sm:text-8xl">
            404...
          </p>

          <h1 className="mt-4 font-bold font-heading text-2xl tracking-tight sm:text-3xl">
            Houston, temos um au-problema!
          </h1>

          <div className="mt-8 flex flex-col gap-2">
            <span className="font-mono font-semibold text-emerald-600 text-xs uppercase tracking-widest dark:text-emerald-400">
              Base responde:
            </span>
            <p className="max-w-md text-base text-muted-foreground leading-relaxed">
              Nosso cãonauta farejou a galáxia inteira, mas essa página descolou
              da mesa. A página que você requisitou não foi encontrada.
            </p>
          </div>

          <Button
            className="mt-7 h-11 px-6 font-semibold"
            nativeButton={false}
            render={<Link href="/home" />}
          >
            Retornar à home
          </Button>
        </div>
      </main>
    </div>
  );
}
