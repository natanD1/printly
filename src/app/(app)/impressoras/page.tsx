import { PageHeader } from "@/components/page-header";
import { PrintersOverview } from "@/components/printers-overview";

export default function ImpressorasPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Cadastre suas impressoras 3D e configure potência, margem e custos operacionais."
        title="Impressoras"
      />
      <PrintersOverview />
    </main>
  );
}
