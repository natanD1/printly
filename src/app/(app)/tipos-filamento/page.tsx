import { FilamentTypesOverview } from "@/components/filament-types-overview";
import { PageHeader } from "@/components/page-header";

export default function TiposFilamentoPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gerencie os tipos de filamento cadastrados no catálogo."
        title="Tipos de Filamento"
      />
      <FilamentTypesOverview />
    </main>
  );
}
