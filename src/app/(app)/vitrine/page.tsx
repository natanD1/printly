import { PageHeader } from "@/components/page-header";
import { ShowcaseOverview } from "@/components/showcase-overview";

export default function VitrinePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Monte uma página pública com seus produtos já produzidos e compartilhe o link com clientes."
        title="Vitrine"
      />
      <ShowcaseOverview />
    </main>
  );
}
