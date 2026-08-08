"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type SkillPillLabels = {
  proficiency: string;
  experience: string;
  group: string;
  primary: string;
  yes: string;
  no: string;
};

export type SkillPillProps = {
  name: string;
  iconUrl: string | null;
  proficiency: "working" | "proficient" | "expert";
  years: number | null;
  isPrimary: boolean;
  /** Pre-translated labels — kept as props so this component stays i18n-agnostic. */
  groupLabel: string;
  proficiencyLabel: string;
  /** Pre-formatted years string, e.g. "5 years" / "1 year" / "—". */
  yearsText: string;
  labels: SkillPillLabels;
  className?: string;
};

/**
 * The single source of truth for how a skill is rendered anywhere on the
 * public site. Icon + name on the pill, everything else surfaces in the
 * hover tooltip.
 */
export function SkillPill({
  name,
  iconUrl,
  years: _years,
  isPrimary,
  groupLabel,
  proficiencyLabel,
  yearsText,
  labels,
  className,
}: SkillPillProps) {
  void _years;
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "border-border bg-card text-foreground inline-flex cursor-default items-center gap-2 rounded-full border py-1 pe-3 ps-1 text-sm transition-colors hover:border-foreground/40",
              isPrimary && "border-accent/60",
              className,
            )}
          >
            <span className="bg-background ring-border/60 grid size-6 place-items-center overflow-hidden rounded-full ring-1 ring-inset">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconUrl}
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                  className="size-4 object-contain dark:invert"
                />
              ) : (
                <span className="text-muted-foreground text-[10px] font-semibold">
                  {name.slice(0, 1)}
                </span>
              )}
            </span>
            <span className="font-medium">{name}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <ul className="flex flex-col gap-1 text-xs">
            <li>
              <span className="opacity-70">{labels.proficiency}:</span>{" "}
              <span className="font-medium">{proficiencyLabel}</span>
            </li>
            <li>
              <span className="opacity-70">{labels.experience}:</span>{" "}
              <span className="font-medium">{yearsText}</span>
            </li>
            <li>
              <span className="opacity-70">{labels.group}:</span>{" "}
              <span className="font-medium">{groupLabel}</span>
            </li>
            <li>
              <span className="opacity-70">{labels.primary}:</span>{" "}
              <span className="font-medium">
                {isPrimary ? labels.yes : labels.no}
              </span>
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
