"use client";

import { useTranslations } from "next-intl";
import { SkillPill, type SkillPillLabels } from "@/components/skill-pill";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const tCommon = useTranslations("common");
  const prev = tCommon("prev");
  const next = tCommon("next");
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
        <Tooltip>
          <TooltipTrigger asChild>
            <CarouselPrevious
              aria-label={prev}
              className="static size-8 translate-y-0"
            />
          </TooltipTrigger>
          <TooltipContent>{prev}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <CarouselNext
              aria-label={next}
              className="static size-8 translate-y-0"
            />
          </TooltipTrigger>
          <TooltipContent>{next}</TooltipContent>
        </Tooltip>
      </div>
    </Carousel>
  );
}
