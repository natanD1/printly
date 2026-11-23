import { z } from "zod";

const LOGO_MAX_BYTES = 500 * 1024;
const LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg"];

export const companyProfileSchema = z.object({
  email: z.union([z.literal(""), z.email("E-mail inválido")]),
  instagram: z.string(),
  logo: z
    .instanceof(File)
    .refine(
      (file) => LOGO_ACCEPTED_TYPES.includes(file.type),
      "O logo deve ser PNG ou JPG"
    )
    .refine((file) => file.size <= LOGO_MAX_BYTES, "O logo deve ter até 500 KB")
    .nullable(),
  name: z.string().trim().min(1, "Nome da empresa é obrigatório"),
  phone: z.string(),
  removeLogo: z.boolean(),
  website: z.string(),
  whatsApp: z.string(),
});

export type CompanyProfileSchema = z.infer<typeof companyProfileSchema>;
