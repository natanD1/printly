"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

type AuthMode = "login" | "register";

const copy = {
  login: {
    description: "Use o e-mail e a senha da sua conta.",
    switchAction: "Criar conta",
    switchPrompt: "Ainda não tem conta?",
    title: "Entrar no Printly",
  },
  register: {
    description: "O cadastro é feito por convite. Tenha seu código em mãos.",
    switchAction: "Entrar",
    switchPrompt: "Já tem conta?",
    title: "Criar conta",
  },
} satisfies Record<AuthMode, Record<string, string>>;

export function AuthForms() {
  const [mode, setMode] = useState<AuthMode>("login");
  const text = copy[mode];

  const toggleMode = useCallback(() => {
    setMode((current) => (current === "login" ? "register" : "login"));
  }, []);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-12 lg:hidden">
        <Image
          alt="Printly"
          className="h-8 w-auto dark:hidden"
          height={256}
          priority
          src="/printly-logo-horizontal.svg"
          width={916}
        />
        <Image
          alt="Printly"
          className="hidden h-8 w-auto dark:block"
          height={256}
          priority
          src="/printly-logo-horizontal-negativo.svg"
          width={916}
        />
      </div>

      <div
        className="fade-in slide-in-from-bottom-1 animate-in duration-300"
        key={mode}
      >
        <h1 className="font-semibold text-3xl tracking-tight">{text.title}</h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          {text.description}
        </p>

        <div className="mt-8">
          {mode === "login" ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>

      <p className="mt-8 flex flex-col space-y-2 text-center text-muted-foreground text-sm">
        {text.switchPrompt}{" "}
        <button
          className="cursor-pointer rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={toggleMode}
          type="button"
        >
          {text.switchAction}
        </button>
      </p>
    </div>
  );
}
