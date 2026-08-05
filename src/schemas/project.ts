import { z } from "zod";
import { slug, uuid } from "./common";

/**
 * PC §5 / blog-schemas.instructions.md pattern, mirrored for projects.
 *
 * Max lengths always enforced (cap DB columns + SEO snippets). Publish
 * thresholds via superRefine so drafts can be saved half-written.
 *
 * SEO overrides: metaTitle / metaDescription are nullable. When blank the
 * public route falls back to title / tagline. If either is filled it must
 * be within the SEO cap AND (on publish) meet the min length.
 */

export const projectCategoryEnum = z.enum([
  "enterprise",
  "product",
  "open_source",
  "nda",
]);

export const linkKindEnum = z.enum([
  "website",
  "case_study",
  "github",
  "demo",
  "app_store",
  "play_store",
  "docs",
  "video",
]);

// Single link row. Zod validates URL shape; App Store / Play Store host
// checks live in the server action so bad kind→host pairings are caught
// before insert (soft warning, not a hard block).
const projectLinkShape = z.object({
  kind: linkKindEnum,
  label: z.string().min(1).max(40),
  url: z.string().url().max(2048),
});

const projectShape = z.object({
  title: z.string().max(120),
  slug: slug(130),
  tagline: z.string().max(200),
  client: z.string().max(100).nullable(),
  location: z.string().max(100).nullable(),
  role: z.string().max(100).nullable(),
  periodStart: z.string().datetime().nullable(),
  periodEnd: z.string().datetime().nullable(),
  body: z.record(z.string(), z.unknown()), // TipTap doc
  outcome: z.string().max(1000).nullable(),
  category: projectCategoryEnum,
  coverMediaId: uuid.nullable(),
  ogImageId: uuid.nullable(),
  metaTitle: z.string().max(70).nullable(),
  metaDescription: z.string().max(160).nullable(),
  noindex: z.boolean(),
  featured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  status: z.enum(["draft", "published"]),
  tagIds: z.array(uuid).max(12),
  links: z.array(projectLinkShape).max(20),
});

export const projectInput = projectShape.superRefine((val, ctx) => {
  if (val.status !== "published") return;
  if (val.title.length < 8) {
    ctx.addIssue({
      code: "custom",
      path: ["title"],
      message: "Title must be at least 8 characters to publish.",
    });
  }
  if (val.tagline.length < 40) {
    ctx.addIssue({
      code: "custom",
      path: ["tagline"],
      message: "Tagline must be at least 40 characters to publish.",
    });
  }
  if (val.metaDescription && val.metaDescription.length < 80) {
    ctx.addIssue({
      code: "custom",
      path: ["metaDescription"],
      message:
        "Meta description override must be at least 80 characters (or leave blank to auto-use the tagline).",
    });
  }
  if (val.coverMediaId === null) {
    ctx.addIssue({
      code: "custom",
      path: ["coverMediaId"],
      message: "A cover image is required to publish a project.",
    });
  }
});

export type ProjectInput = z.infer<typeof projectInput>;
export type ProjectLinkInput = z.infer<typeof projectLinkShape>;
