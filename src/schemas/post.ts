import { z } from "zod";
import { slug, uuid } from "./common";

/** PC §5 / blog-schemas.instructions.md. */
export const postInput = z.object({
  title: z.string().min(10).max(70),
  slug: slug(75),
  metaDescription: z.string().min(120).max(160),
  excerpt: z.string().min(200).max(300),
  body: z.record(z.string(), z.unknown()), // Tiptap JSON doc
  coverMediaId: uuid.nullable(),
  categoryId: uuid.nullable(),
  tagIds: z.array(uuid).max(8),
  status: z.enum(["draft", "published"]),
});

export type PostInput = z.infer<typeof postInput>;
