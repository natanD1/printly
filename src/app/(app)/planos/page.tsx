import { PageHeader } from "@/components/page-header";
import { PlansOverview } from "@/components/plans-overview";

export default function PlanosPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Configure limites, recursos e visibilidade de cada plano."
        title="Planos"
      />
      <PlansOverview />
    </main>
  );
}
