import { z } from "zod";

export const linkInput = z.object({
  label: z.string().min(1).max(60),
  url: z.string().url(),
  sortOrder: z.number().int().min(0).default(0),
});

export type LinkInput = z.infer<typeof linkInput>;
