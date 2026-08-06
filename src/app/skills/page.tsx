import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { tag } from "@/lib/cache-tags";
import {
  listPublicSkillsGrouped,
  type PublicSkillGroup,
} from "@/lib/db/queries/skills";
import { SKILL_GROUP_LABEL, SKILL_PROFICIENCY_LABEL } from "@/lib/skill-groups";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "The stack I ship with: TypeScript, NestJS, PostgreSQL, Kafka/BullMQ, AWS, LLM/RAG, and more.",
  alternates: { canonical: "/skills" },
};

async function loadGroups(): Promise<PublicSkillGroup[]> {
  "use cache";
  cacheTag(tag.skills());
  return listPublicSkillsGrouped();
}

const PROFICIENCY_TONE: Record<keyof typeof SKILL_PROFICIENCY_LABEL, string> = {
  working: "text-muted-foreground border-border",
  proficient: "text-foreground border-foreground/40",
  expert:
    "text-[var(--color-accent-strong)] border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10",
};

export default async function SkillsPage() {
  const groups = await loadGroups();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24">
      <header className="mb-12 max-w-2xl">
        <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
          Stack
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          Skills
        </h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
          What I reach for in production. Grouped by domain, ordered by how
          often I use it.
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Skills will appear here once added from the dashboard.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ group, items }) => (
            <section key={group}>
              <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
                {SKILL_GROUP_LABEL[group]}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <li
                    key={s.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${PROFICIENCY_TONE[s.proficiency]}`}
                    title={`${SKILL_PROFICIENCY_LABEL[s.proficiency]}${
                      s.years
                        ? ` · ${s.years} yr${s.years === 1 ? "" : "s"}`
                        : ""
                    }`}
                  >
                    <span className="font-medium">{s.name}</span>
                    {s.years ? (
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {s.years}y
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
