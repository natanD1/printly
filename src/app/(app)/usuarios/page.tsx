import { PageHeader } from "@/components/page-header";
import { UsersOverview } from "@/components/users-overview";

export default function UsuariosPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <PageHeader
        description="Gerencie os usuários cadastrados e altere o plano de cada conta."
        title="Usuários"
      />
      <UsersOverview />
    </main>
  );
}
