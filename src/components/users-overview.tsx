"use client";

import { RefreshCw, Search } from "lucide-react";
import { type ChangeEvent, useCallback, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { buildUsersColumns } from "@/components/users-columns";
import { useAdminShowcases } from "@/hooks/use-admin-showcases";
import { useAuth } from "@/hooks/use-auth";
import { useManagedUsers } from "@/hooks/use-managed-users";
import { usePlans } from "@/hooks/use-plans";

export function UsersOverview() {
  const { changeUserPlan, error, fetchUsers, isLoading, users } =
    useManagedUsers();
  const { error: plansError, plans } = usePlans();
  const { user: currentUser } = useAuth();
  const {
    error: showcasesError,
    setBlocked,
    showcases,
  } = useAdminShowcases(Boolean(currentUser?.isAdmin));
  const [search, setSearch] = useState("");

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  }, [search, users]);

  const showcasesByUser = useMemo(
    () => new Map(showcases.map((showcase) => [showcase.userId, showcase])),
    [showcases]
  );

  const columns = useMemo(
    () => buildUsersColumns(plans, changeUserPlan, showcasesByUser, setBlocked),
    [changeUserPlan, plans, setBlocked, showcasesByUser]
  );

  const errorMessage = error ?? plansError ?? showcasesError;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            onChange={handleSearchChange}
            placeholder="Buscar por nome ou e-mail..."
            value={search}
          />
        </div>

        <Button onClick={fetchUsers} size="lg" variant="outline">
          <RefreshCw />
          Atualizar
        </Button>
      </div>

      <p className="text-muted-foreground text-sm">
        Administradores não têm limites, independentemente do plano.
      </p>

      {errorMessage ? (
        <p className="text-destructive text-sm">{errorMessage}</p>
      ) : null}

      {isLoading ? (
        <Skeleton className="min-h-96 w-full flex-1" />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          emptyMessage="Nenhum usuário encontrado."
          pageSize={10}
        />
      )}
    </div>
  );
}
