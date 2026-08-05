import { z } from "zod";
import { slug, uuid } from "./common";

/**
 * One row per role. A promotion (e.g. ZMC: Sr. Software Engineer →
 * Sr. Backend Architect) is two rows sharing companySlug; the render
 * layer groups them.
 *
 * Publish gate blocks summary < 80 chars so the resulting meta_description
 * fallback is SEO-usable.
 */

export const workTypeEnum = z.enum(["on_site", "remote", "hybrid"]);

const experienceShape = z.object({
  company: z.string().min(1).max(120),
  companySlug: slug(130),
  role: z.string().min(1).max(120),
  slug: slug(200),
  location: z.string().max(100).nullable(),
  workType: workTypeEnum.nullable(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime().nullable(),
  summary: z.string().max(240),
  highlights: z.record(z.string(), z.unknown()), // TipTap doc — resume bullets
  companyUrl: z.string().url().max(2048).nullable(),
  companyLogoId: uuid.nullable(),
  metaTitle: z.string().max(70).nullable(),
  metaDescription: z.string().max(160).nullable(),
  ogImageId: uuid.nullable(),
  noindex: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  status: z.enum(["draft", "published"]),
  tagIds: z.array(uuid).max(20),
});

export const experienceInput = experienceShape.superRefine((val, ctx) => {
  if (val.periodEnd) {
    const start = Date.parse(val.periodStart);
    const end = Date.parse(val.periodEnd);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["periodEnd"],
        message: "End date must be on or after start date.",
      });
    }
  }
  if (val.status !== "published") return;
  if (val.summary.length < 80) {
    ctx.addIssue({
      code: "custom",
      path: ["summary"],
      message: "Summary must be at least 80 characters to publish.",
    });
  }
  if (val.metaDescription && val.metaDescription.length < 80) {
    ctx.addIssue({
      code: "custom",
      path: ["metaDescription"],
      message:
        "Meta description override must be at least 80 characters (or leave blank to auto-use the summary).",
    });
  }
});

export type ExperienceInput = z.infer<typeof experienceInput>;
