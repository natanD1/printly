import { PageHeader } from "@/components/page-header";
import { PrinterModelsOverview } from "@/components/printer-models-overview";

export default function ModelosImpressoraPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gerencie os modelos de impressora vinculados a cada marca."
        title="Modelos de Impressora"
      />
      <PrinterModelsOverview />
    </main>
  );
}
