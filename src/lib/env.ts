import { z } from "zod";

const envSchema = z.object({
  API_URL: z.url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  /** URL pública do site (ex: https://app.printly.com.br), usada em links absolutos como `og:image`. Sem ela, usa o header `host`. */
  SITE_URL: z.url().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Variáveis de ambiente inválidas:\n${z.prettifyError(parsedEnv.error)}`
  );
}

export const env = parsedEnv.data;
