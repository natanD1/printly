import { HomeOverview } from "@/components/home-overview";
import { PageHeader } from "@/components/page-header";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Acompanhe seus indicadores, orçamentos e produtos fabricados por período."
        title="Home"
      />
      <HomeOverview />
    </main>
  );
}
