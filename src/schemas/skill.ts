import { z } from "zod";
import { slug, uuid } from "./common";

/**
 * Skills are a flat, grouped list. No per-skill detail page (YAGNI) — the
 * slug is kept anyway so we can add one later without a migration.
 */

export const skillGroupEnum = z.enum([
  "languages",
  "backend",
  "database",
  "messaging_async",
  "cloud_devops",
  "ai_llm",
  "testing_performance",
  "integrations",
  "security_practice",
  "frontend",
  "working_knowledge",
]);

export const skillProficiencyEnum = z.enum(["working", "proficient", "expert"]);

export const skillInput = z.object({
  name: z.string().min(1).max(60),
  slug: slug(70),
  group: skillGroupEnum,
  proficiency: skillProficiencyEnum,
  years: z.number().int().min(0).max(60).nullable(),
  isPrimary: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
  iconMediaId: uuid.nullable(),
  status: z.enum(["active", "archived"]),
});

export type SkillInput = z.infer<typeof skillInput>;
