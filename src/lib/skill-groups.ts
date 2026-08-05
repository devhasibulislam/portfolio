import type { SkillInput } from "@/schemas/skill";

/**
 * Human-readable labels + display order for skill groups. `values`
 * mirrors the pgEnum in schema.ts and the Zod enum in schemas/skill.ts —
 * update all three when adding a new group.
 */
export const SKILL_GROUPS: {
  value: SkillInput["group"];
  label: string;
}[] = [
  { value: "languages", label: "Languages" },
  { value: "backend", label: "Backend" },
  { value: "database", label: "Database" },
  { value: "messaging_async", label: "Messaging & async" },
  { value: "cloud_devops", label: "Cloud & DevOps" },
  { value: "ai_llm", label: "AI & LLM" },
  { value: "testing_performance", label: "Testing & performance" },
  { value: "integrations", label: "Integrations" },
  { value: "security_practice", label: "Security & practice" },
  { value: "frontend", label: "Frontend" },
  { value: "working_knowledge", label: "Working knowledge" },
];

export const SKILL_GROUP_LABEL: Record<SkillInput["group"], string> =
  Object.fromEntries(SKILL_GROUPS.map((g) => [g.value, g.label])) as Record<
    SkillInput["group"],
    string
  >;

export const SKILL_PROFICIENCY_LABEL: Record<
  SkillInput["proficiency"],
  string
> = {
  working: "Working knowledge",
  proficient: "Proficient",
  expert: "Expert",
};
