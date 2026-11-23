import { PageHeader } from "@/components/page-header";
import { PrinterBrandsOverview } from "@/components/printer-brands-overview";

export default function MarcasImpressoraPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gerencie as marcas de impressora disponíveis no catálogo."
        title="Marcas de Impressora"
      />
      <PrinterBrandsOverview />
    </main>
  );
}
