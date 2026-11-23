"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FieldError } from "@/components/field-error";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { type LoginSchema, loginSchema } from "@/schemas/login-schema";

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    await login(data)
      .then((user) =>
        router.push(user.onboardingCompleted ? "/home" : "/onboarding")
      )
      .catch(() => null);
  });

  return (
    <form className="flex flex-col gap-5" onSubmit={onSubmit}>
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
          autoComplete="current-password"
          className="h-10"
          id="password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <FieldError message={error ?? undefined} />

      <Button className="mt-1 h-10 w-full" disabled={isLoading} type="submit">
        {isLoading ? <Spinner /> : null}
        Entrar
      </Button>
    </form>
  );
}
