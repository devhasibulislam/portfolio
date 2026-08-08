import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { tag } from "@/lib/cache-tags";
import { listPublicSkillsGrouped } from "@/lib/db/queries/skills";
import { SKILL_GROUPS } from "@/lib/skill-groups";
import { SkillPill, type SkillPillLabels } from "@/components/skill-pill";
import { DragScrollStrip } from "./drag-scroll-strip";
import { SectionHeader, SeeAllLink, bezelInner, bezelOuter } from "./_shared";
import { Spotlight } from "./spotlight";
import { cn } from "@/lib/utils";

async function loadGrouped() {
  "use cache";
  cacheTag(tag.skills());
  return listPublicSkillsGrouped();
}

const MAX_GROUPS_ON_HOME = 6;
const MAX_ITEMS_PER_GROUP = 8;

export async function SectionCoreSkills() {
  const [groups, t, tGroups, tProf, tPill] = await Promise.all([
    loadGrouped(),
    getTranslations("home.coreSkills"),
    getTranslations("skills.groups"),
    getTranslations("skills.proficiency"),
    getTranslations("skills.pill"),
  ]);

  if (groups.length === 0) return null;

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

  // Preserve the canonical group order from skill-groups.ts, drop empties,
  // cap to a reasonable home-page density (full list lives at /skills).
  const orderIndex = new Map(SKILL_GROUPS.map((g, i) => [g.value, i]));
  const ordered = [...groups]
    .sort(
      (a, b) =>
        (orderIndex.get(a.group) ?? 99) - (orderIndex.get(b.group) ?? 99),
    )
    .slice(0, MAX_GROUPS_ON_HOME);

  return (
    <section
      aria-labelledby="core-skills-title"
      className="relative mx-auto w-full max-w-6xl px-6 py-16 sm:py-20 md:py-24"
    >
      <SectionHeader
        title={t("title")}
        id="core-skills-title"
        action={<SeeAllLink href="/skills" label={t("seeAll")} />}
      />
      <DragScrollStrip className="scrollbar-thin -mx-6 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-px-6 px-6 pb-4">
        {ordered.map((g) => {
          const items = g.items
            .slice()
            .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
            .slice(0, MAX_ITEMS_PER_GROUP);
          return (
            <li
              key={g.group}
              className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-105"
            >
              <Spotlight>
                <div className={cn(bezelOuter, "h-full")}>
                  <div className={cn(bezelInner, "flex h-full flex-col p-6")}>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {tGroups(g.group)}
                    </h3>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {items.map((s) => (
                        <li key={s.id}>
                          <SkillPill
                            name={s.name}
                            iconUrl={s.iconUrl}
                            proficiency={s.proficiency}
                            years={s.years}
                            isPrimary={s.isPrimary}
                            groupLabel={tGroups(g.group)}
                            proficiencyLabel={tProf(s.proficiency)}
                            yearsText={yearsText(s.years)}
                            labels={pillLabels}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Spotlight>
            </li>
          );
        })}
      </DragScrollStrip>
    </section>
  );
}
