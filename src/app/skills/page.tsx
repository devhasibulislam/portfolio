import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import {
  listPublicSkillsGrouped,
  type PublicSkillGroup,
} from "@/lib/db/queries/skills";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { SkillPill, type SkillPillLabels } from "@/components/skill-pill";

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

export default async function SkillsPage() {
  const [groups, t, groupLabels, profLabels, tPill] = await Promise.all([
    loadGroups(),
    getTranslations("skills"),
    getTranslations("skills.groups"),
    getTranslations("skills.proficiency"),
    getTranslations("skills.pill"),
  ]);

  const pillLabels: SkillPillLabels = {
    proficiency: tPill("proficiency"),
    experience: tPill("experience"),
    group: tPill("group"),
    primary: tPill("primary"),
    yes: tPill("yes"),
    no: tPill("no"),
  };
  const yearsText = (n: number | null): string =>
    n == null
      ? tPill("emDash")
      : n === 1
        ? tPill("yearShort")
        : tPill("yearsShort", { n });

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24">
      <PageBreadcrumb trail={[{ label: t("heading") }]} />
      <header className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl md:text-6xl">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
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
                  <li key={s.id}>
                    <SkillPill
                      name={s.name}
                      iconUrl={s.iconUrl}
                      proficiency={s.proficiency}
                      years={s.years}
                      isPrimary={s.isPrimary}
                      groupLabel={groupLabels(group)}
                      proficiencyLabel={profLabels(s.proficiency)}
                      yearsText={yearsText(s.years)}
                      labels={pillLabels}
                    />
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
