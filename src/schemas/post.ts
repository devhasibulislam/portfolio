import { z } from "zod";
import { slug, uuid } from "./common";

/**
 * PC \u00a75 / blog-schemas.instructions.md.
 *
 * Max lengths are always enforced (they cap DB columns + SEO snippets).
 * Min lengths (title \u226510, metaDescription \u2265120, excerpt \u2265200) are only
 * enforced when the author actually publishes \u2014 drafts can be saved half-
 * written without fighting the form.
 */
const postShape = z.object({
  title: z.string().max(70),
  slug: slug(75),
  metaDescription: z.string().max(160),
  excerpt: z.string().max(300),
  body: z.record(z.string(), z.unknown()), // Tiptap JSON doc
  coverMediaId: uuid.nullable(),
  categoryId: uuid.nullable(),
  tagIds: z.array(uuid).max(8),
  status: z.enum(["draft", "published"]),
});

export const postInput = postShape.superRefine((val, ctx) => {
  if (val.status !== "published") return;
  if (val.title.length < 10) {
    ctx.addIssue({
      code: "custom",
      path: ["title"],
      message: "Title must be at least 10 characters to publish.",
    });
  }
  if (val.metaDescription.length < 120) {
    ctx.addIssue({
      code: "custom",
      path: ["metaDescription"],
      message: "Meta description must be at least 120 characters to publish.",
    });
  }
  if (val.excerpt.length < 200) {
    ctx.addIssue({
      code: "custom",
      path: ["excerpt"],
      message: "Excerpt must be at least 200 characters to publish.",
    });
  }
});

export type PostInput = z.infer<typeof postInput>;
