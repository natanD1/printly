import Image from "next/image";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between gap-2 px-4 sm:px-6">
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
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col items-center px-4 pt-4 pb-10 sm:px-6">
        {children}
      </main>
    </div>
  );
}
