import { z } from "zod";
import { slug } from "./common";

export const tagInput = z.object({
  name: z.string().min(1).max(30),
  slug: slug(30),
});

export type TagInput = z.infer<typeof tagInput>;
