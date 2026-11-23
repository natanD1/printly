import { FilamentsOverview } from "@/components/filaments-overview";
import { PageHeader } from "@/components/page-header";

export default function FilamentosPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Controle seus filamentos disponíveis, pesos restantes e custos por material."
        title="Filamentos"
      />
      <FilamentsOverview />
    </main>
  );
}
