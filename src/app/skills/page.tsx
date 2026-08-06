import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import {
  listPublicSkillsGrouped,
  type PublicSkillGroup,
} from "@/lib/db/queries/skills";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getTranslations("meta.skills");
  return {
    title: m("title"),
    description: m("description"),
    alternates: { canonical: "/skills" },
  };
}

async function loadGroups(): Promise<PublicSkillGroup[]> {
  "use cache";
  cacheTag(tag.skills());
  return listPublicSkillsGrouped();
}

// Proficiency-tinted classes; the label text itself comes from i18n.
const PROFICIENCY_TONE = {
  working: "text-muted-foreground border-border",
  proficient: "text-foreground border-foreground/40",
  expert:
    "text-[var(--color-accent-strong)] border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10",
} as const;

export default async function SkillsPage() {
  const [groups, t, groupLabels, profLabels] = await Promise.all([
    loadGroups(),
    getTranslations("skills"),
    getTranslations("skills.groups"),
    getTranslations("skills.proficiency"),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24">
      <header className="mb-12 max-w-2xl">
        <p className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-[0.24em]">
          {t("kicker")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
          {t("hero")}
        </p>
      </header>

      {groups.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">{t("empty")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ group, items }) => (
            <section key={group}>
              <h2 className="text-muted-foreground mb-3 text-xs font-medium tracking-widest uppercase">
                {groupLabels(group)}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {items.map((s) => (
                  <li
                    key={s.id}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${PROFICIENCY_TONE[s.proficiency]}`}
                    title={`${profLabels(s.proficiency)}${
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
