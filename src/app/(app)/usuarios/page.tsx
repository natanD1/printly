import { UsersOverview } from "@/components/users-overview";

export default function UsuariosPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          Usuários
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie os usuários cadastrados e altere o plano de cada conta.
        </p>
      </div>
      <UsersOverview />
    </main>
  );
}
