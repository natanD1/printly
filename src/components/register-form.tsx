"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { type RegisterSchema, registerSchema } from "@/schemas/register-schema";

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await registerUser(data)
      .then(() => router.push("/home"))
      .catch(() => null);
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input
          autoComplete="name"
          className="h-10"
          id="name"
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          autoComplete="email"
          className="h-10"
          id="email"
          type="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <Input
          autoComplete="new-password"
          className="h-10"
          id="password"
          type="password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="inviteCode">Código de convite</Label>
        <Input
          autoComplete="off"
          className="h-10"
          id="inviteCode"
          {...register("inviteCode")}
        />
        <FieldError message={errors.inviteCode?.message} />
      </div>

      <FieldError message={error ?? undefined} />

      <Button className="mt-1 h-10 w-full" disabled={isLoading} type="submit">
        {isLoading ? <Spinner /> : null}
        Criar conta
      </Button>
    </form>
  );
}
