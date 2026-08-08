"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/** Country-code abbreviation with an always-visible dashed underline and a shadcn tooltip that spells out the country name. */
export function CountryCodeTooltip({
  code,
  name,
}: {
  code: string;
  name: string;
}) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <abbr
            title={name}
            className="cursor-help underline decoration-dotted decoration-1 underline-offset-4"
          >
            {code}
          </abbr>
        </TooltipTrigger>
        <TooltipContent>{name}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
