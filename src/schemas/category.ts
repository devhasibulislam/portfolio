import { z } from "zod";
import { slug } from "./common";

export const categoryInput = z.object({
  name: z.string().min(1).max(30),
  slug: slug(30),
});

export type CategoryInput = z.infer<typeof categoryInput>;
