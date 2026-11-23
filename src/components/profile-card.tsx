"use client";

import { KeyRound, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export function ProfileCard() {
  const { user } = useAuth();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <User aria-hidden="true" className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Dados da sua conta</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2.5">
          <span className="text-muted-foreground text-xs">Nome</span>
          {user ? (
            <p className="font-medium text-sm">{user.name}</p>
          ) : (
            <Skeleton className="h-5 w-40" />
          )}
        </div>
        <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 px-3 py-2.5">
          <span className="text-muted-foreground text-xs">E-mail</span>
          {user ? (
            <p className="font-medium text-sm">{user.email}</p>
          ) : (
            <Skeleton className="h-5 w-56" />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-wrap justify-between gap-3">
        <span className="text-muted-foreground text-xs">
          Alteração de senha em breve.
        </span>
        <Button disabled size="sm" variant="outline">
          <KeyRound />
          Trocar senha
        </Button>
      </CardFooter>
    </Card>
  );
}
