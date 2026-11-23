import Image from "next/image";
import type { CSSProperties } from "react";

// Linhas de camada de impressão FDM no fundo do painel.
const layerLinesStyle: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, rgb(143 118 255 / 0.07) 0 1px, transparent 1px 8px)",
};

export function AuthArt() {
  return (
    <aside
      // Preso na altura da tela: o formulário (barra de força da senha) cresce
      // e rola sozinho, sem esticar o painel nem mover o texto.
      className="relative hidden flex-col justify-between overflow-hidden bg-brand-ink p-12 text-white lg:sticky lg:top-0 lg:flex lg:h-svh lg:self-start xl:p-16"
      style={layerLinesStyle}
    >
      <Image
        alt="Printly"
        className="h-12 w-auto self-start"
        height={256}
        priority
        src="/printly-logo-horizontal-negativo.svg"
        width={916}
      />

      <div className="max-w-md">
        <h2 className="text-balance font-semibold text-4xl leading-[1.1] tracking-tight xl:text-5xl">
          Cada peça com o preço certo.
        </h2>
        <p className="mt-4 max-w-sm text-pretty text-base text-white/65 leading-relaxed">
          Filamento, energia e desgaste da impressora entram na conta sozinhos.
        </p>
      </div>
    </aside>
  );
}
