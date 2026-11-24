import Image from "next/image";

export function PublicShowcaseFooter() {
  return (
    <footer className="border-t bg-card/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <Image
            alt="Coruja Printly"
            className="size-5 shrink-0"
            height={256}
            src="/printly-simbolo.svg"
            width={256}
          />
          <span>Feito com Printly</span>
        </div>

        <div className="flex items-center">
          <Image
            alt="Printly"
            className="h-5 w-auto dark:hidden"
            height={256}
            src="/printly-logo-horizontal.svg"
            width={916}
          />
          <Image
            alt="Printly"
            className="hidden h-5 w-auto dark:block"
            height={256}
            src="/printly-logo-horizontal-negativo.svg"
            width={916}
          />
        </div>
      </div>
    </footer>
  );
}
