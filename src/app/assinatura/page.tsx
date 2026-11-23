import { Rocket } from "lucide-react";
import { PricingOverview } from "@/components/pricing-overview";
import { Badge } from "@/components/ui/badge";

export default function AssinaturaPage() {
  return (
    <>
      <section className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <Badge className="gap-1.5 px-3 py-1" variant="secondary">
          <Rocket aria-hidden="true" className="size-3.5 text-primary" />
          Planos e assinatura
        </Badge>
        <h1 className="font-bold font-heading text-3xl tracking-tight sm:text-4xl">
          Escolha seu plano
        </h1>
        <p className="max-w-xl text-base text-muted-foreground">
          Consulte os valores, compare recursos e encontre o plano ideal para o
          ritmo da sua produção 3D.
        </p>
      </section>

      <PricingOverview />
    </>
  );
}
