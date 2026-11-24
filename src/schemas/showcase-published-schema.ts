import { z } from "zod";

export const showcasePublishedSchema = z.object({
  isPublished: z.boolean(),
});

export type ShowcasePublishedSchema = z.infer<typeof showcasePublishedSchema>;
