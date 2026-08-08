"use client";

import { SkillPill, type SkillPillLabels } from "@/components/skill-pill";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export type SkillPillItem = {
  id: string;
  name: string;
  iconUrl: string | null;
  proficiency: "working" | "proficient" | "expert";
  years: number | null;
  isPrimary: boolean;
  groupLabel: string;
  proficiencyLabel: string;
  yearsText: string;
};

/** Draggable horizontal carousel of skill pills with prev/next arrows. */
export function SkillsCarousel({
  items,
  labels,
}: {
  items: SkillPillItem[];
  labels: SkillPillLabels;
}) {
  return (
    <Carousel
      opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}
      className="mt-4"
    >
      <CarouselContent className="-ms-2">
        {items.map((s) => (
          <CarouselItem key={s.id} className="ps-2 basis-auto">
            <SkillPill
              name={s.name}
              iconUrl={s.iconUrl}
              proficiency={s.proficiency}
              years={s.years}
              isPrimary={s.isPrimary}
              groupLabel={s.groupLabel}
              proficiencyLabel={s.proficiencyLabel}
              yearsText={s.yearsText}
              labels={labels}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="mt-3 flex justify-end gap-2">
        <CarouselPrevious className="static translate-y-0 size-8" />
        <CarouselNext className="static translate-y-0 size-8" />
      </div>
    </Carousel>
  );
}
