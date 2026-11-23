import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Escolha seu plano | Printly",
};

export default function AssinaturaLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            aria-label="Voltar para o início"
            className="inline-flex cursor-pointer items-center"
            href="/home"
          >
            <Image
              alt="Printly"
              className="h-6 w-auto dark:hidden"
              height={256}
              priority
              src="/printly-logo-horizontal.svg"
              width={916}
            />
            <Image
              alt="Printly"
              className="hidden h-6 w-auto dark:block"
              height={256}
              priority
              src="/printly-logo-horizontal-negativo.svg"
              width={916}
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              nativeButton={false}
              render={<Link href="/home" />}
              size="sm"
              variant="ghost"
            >
              <ArrowLeft />
              Voltar ao app
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
    </div>
  );
}
