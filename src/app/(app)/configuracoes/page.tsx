import { PageHeader } from "@/components/page-header";
import { SettingsOverview } from "@/components/settings-overview";

export default function ConfiguracoesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        description="Gerencie sua conta, energia, plano e a identidade da sua empresa."
        title="Configurações"
      />
      <SettingsOverview />
    </main>
  );
}
