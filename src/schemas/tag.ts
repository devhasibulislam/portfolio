import { z } from "zod";
import { slug } from "./common";

export const tagKindEnum = z.enum(["blog", "tech"]);

export const tagInput = z.object({
  name: z.string().min(1).max(30),
  slug: slug(30),
  // Existing rows backfill to "blog" via DB default; new rows must pick.
  kind: tagKindEnum,
});

export type TagInput = z.infer<typeof tagInput>;
