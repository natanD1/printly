import { z } from "zod";
import {
  isWithinPasswordMaxLength,
  PASSWORD_RULES,
} from "@/utils/password-rules";

export const registerSchema = z.object({
  email: z.email("E-mail inválido"),
  inviteCode: z.string().trim().min(1, "Informe o código de convite"),
  name: z.string().trim().min(2, "Informe seu nome completo"),
  password: z.string().superRefine((value, ctx) => {
    const missing = PASSWORD_RULES.filter((rule) => !rule.test(value));

    if (missing.length > 0) {
      ctx.addIssue({
        code: "custom",
        message: `A senha precisa ter: ${missing
          .map((rule) => rule.label.toLowerCase())
          .join(", ")}`,
      });
    }

    if (!isWithinPasswordMaxLength(value)) {
      ctx.addIssue({
        code: "custom",
        message: "A senha deve ter no máximo 72 bytes (acentos contam 2)",
      });
    }
  }),
});

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
