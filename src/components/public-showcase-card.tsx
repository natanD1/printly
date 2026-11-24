import { ImageIcon } from "lucide-react";
import type { PublicShowcaseItem } from "@/types/showcase";
import { formatCurrency } from "@/utils/format-currency";

interface PublicShowcaseCardProps {
  item: PublicShowcaseItem;
  slug: string;
}

export function PublicShowcaseCard({ item, slug }: PublicShowcaseCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card text-card-foreground ring-1 ring-border/80 transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/60">
        {item.hasPhoto ? (
          // biome-ignore lint/performance/noImgElement: imagem dinâmica servida pelo route handler público
          <img
            alt={item.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            height={400}
            loading="lazy"
            src={`/api/public/loja/${slug}/foto/${item.productId}`}
            width={400}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-muted/50 text-muted-foreground/45"
          >
            <ImageIcon className="size-9 stroke-[1.5]" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-3 sm:p-4">
        <h3 className="line-clamp-2 font-heading font-medium text-foreground text-sm leading-snug sm:text-base">
          {item.name}
        </h3>
        <p className="font-semibold text-base text-primary tabular-nums sm:text-lg">
          {formatCurrency(item.unitPrice)}
        </p>
      </div>
    </article>
  );
}
