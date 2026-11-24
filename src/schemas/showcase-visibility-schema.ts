import { z } from "zod";

export const showcaseVisibilitySchema = z.object({
  isVisible: z.boolean(),
});

export type ShowcaseVisibilitySchema = z.infer<typeof showcaseVisibilitySchema>;
