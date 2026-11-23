import { FilamentBrandsOverview } from "@/components/filament-brands-overview";
import { PageHeader } from "@/components/page-header";

export default function MarcasFilamentoPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gerencie o catálogo de marcas de filamento disponíveis no sistema."
        title="Marcas de Filamento"
      />
      <FilamentBrandsOverview />
    </main>
  );
}
