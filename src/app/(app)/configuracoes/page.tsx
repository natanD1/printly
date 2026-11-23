import { SettingsOverview } from "@/components/settings-overview";

export default function ConfiguracoesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie sua conta, energia, plano e a identidade da sua empresa.
        </p>
      </div>
      <SettingsOverview />
    </main>
  );
}
