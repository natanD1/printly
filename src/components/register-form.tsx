"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { PasswordInput } from "@/components/password-input";
import { PasswordStrength } from "@/components/password-strength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import {
  type RegisterFormSchema,
  registerFormSchema,
} from "@/schemas/register-schema";

export function RegisterForm() {
  const { register: registerUser, isLoading, error } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema),
  });

  const password = watch("password") ?? "";

  // Revalida a confirmação quando a senha muda e ela já foi preenchida.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `password` é o gatilho
  useEffect(() => {
    if (getValues("confirmPassword")) {
      trigger("confirmPassword");
    }
  }, [password, getValues, trigger]);

  const onSubmit = handleSubmit(async (data) => {
    await registerUser({
      email: data.email,
      inviteCode: data.inviteCode,
      name: data.name,
      password: data.password,
    })
      .then((user) =>
        router.push(user.onboardingCompleted ? "/home" : "/onboarding")
      )
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
        <PasswordInput
          autoComplete="new-password"
          className="h-10"
          id="password"
          {...register("password")}
        />
        <PasswordStrength password={password} />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <PasswordInput
          autoComplete="new-password"
          className="h-10"
          id="confirmPassword"
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
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
