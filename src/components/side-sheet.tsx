import type { ReactNode } from "react";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SideSheetContentProps {
  children: ReactNode;
  /** `wide` para formulários longos (produto, impressora, filamento). */
  size?: "default" | "wide";
  title: ReactNode;
}

/**
 * Painel lateral direito usado no lugar de modal: cabeçalho fixo, corpo com
 * rolagem própria e, nos formulários, ações presas no rodapé
 * (`SideSheetActions`). O popup em si não rola, pra o botão de fechar
 * continuar visível.
 */
export function SideSheetContent({
  children,
  size = "default",
  title,
}: SideSheetContentProps) {
  return (
    <SheetContent
      className={cn(
        "gap-0 p-0 data-[side=right]:w-full",
        size === "wide"
          ? "data-[side=right]:sm:max-w-xl"
          : "data-[side=right]:sm:max-w-md"
      )}
    >
      <SheetHeader className="border-b px-6 py-5 pr-14">
        <SheetTitle className="font-semibold text-lg tracking-tight">
          {title}
        </SheetTitle>
      </SheetHeader>
      {/* Sem padding inferior quando há rodapé: o padding do scroller reduz a
          área do `sticky`, e o rodapé ficava solto com conteúdo aparecendo
          embaixo dele. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-5 pb-6 has-data-[slot=side-sheet-actions]:pb-0">
        {children}
      </div>
    </SheetContent>
  );
}

/** Rodapé de ações do formulário, preso ao fim do painel enquanto o corpo rola. */
export function SideSheetActions({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-6 mt-auto flex justify-end gap-2 border-t bg-popover px-6 py-4"
      data-slot="side-sheet-actions"
    >
      {children}
    </div>
  );
}
