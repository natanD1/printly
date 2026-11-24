import { z } from "zod";

export const showcaseBlockSchema = z.object({
  isBlocked: z.boolean(),
});

export type ShowcaseBlockSchema = z.infer<typeof showcaseBlockSchema>;
