import { z } from "zod";
import { isUuid } from "@/utils/showcase-slug";

export const SHOWCASE_MAX_ITEMS_PER_REQUEST = 100;

/** Usado pra adicionar itens (1–100 ids) e pra reordenar (lista completa). */
export const showcaseProductIdsSchema = z.object({
  productIds: z
    .array(z.string().refine(isUuid, "Produto inválido"))
    .min(1, "Selecione ao menos um produto")
    .max(
      SHOWCASE_MAX_ITEMS_PER_REQUEST,
      `Selecione no máximo ${SHOWCASE_MAX_ITEMS_PER_REQUEST} produtos por vez`
    ),
});

export type ShowcaseProductIdsSchema = z.infer<typeof showcaseProductIdsSchema>;
