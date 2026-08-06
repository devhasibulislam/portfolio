"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type TagOption = { id: string; name: string };

type Props = {
  options: TagOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
};

/**
 * Chips + shadcn Command palette popover. cmdk provides:
 *   - Fuzzy filtering as the user types
 *   - Keyboard navigation (Arrow / Enter / Escape) baked in
 *   - Hover + selected visual states via `data-selected`
 *
 * Constraints preserved from the previous implementation:
 *   - No loose tags: the picker only surfaces IDs from `options`.
 *   - Cap of `max` (defaults to 8, matches PROJECT_CONTEXT §5).
 *   - Backspace with an empty search removes the last chip.
 *   - The popover stays open after a pick so the owner can rapid-add.
 */
export function TagMultiPicker({ options, value, onChange, max = 8 }: Props) {
  const t = useTranslations("dashboard.forms.tag");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = new Set(value);
  const atMax = value.length >= max;

  const toggle = (id: string) => {
    if (selected.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else if (!atMax) {
      onChange([...value, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Chip row + add-trigger. Wraps at any width. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <span
              key={id}
              className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md ps-2 pe-1 py-0.5 text-xs font-medium"
            >
              {opt.name}
              <button
                type="button"
                aria-label={`Remove ${opt.name}`}
                onClick={() => onChange(value.filter((v) => v !== id))}
                className="hover:bg-primary/20 rounded-sm p-0.5 transition-colors"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={atMax}
              className="h-7 gap-1 px-2 text-xs"
              aria-label={atMax ? t("maxReached", { n: max }) : t("addTag")}
            >
              <Plus className="size-3" />
              {atMax ? t("maxLabel", { n: max }) : t("addTag")}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            side="bottom"
            className="w-64 p-0"
            // Preserve the "backspace deletes last chip" affordance from the
            // old picker by intercepting keydown on the popover surface.
            onKeyDownCapture={(e) => {
              if (e.key === "Backspace" && search === "" && value.length > 0) {
                e.preventDefault();
                onChange(value.slice(0, -1));
              }
            }}
          >
            <Command>
              <CommandInput
                placeholder={t("searchPlaceholder")}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>
                  {options.length === 0 ? t("noneYet") : t("noMatches")}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((o) => {
                    const isSelected = selected.has(o.id);
                    const disabled = atMax && !isSelected;
                    return (
                      <CommandItem
                        key={o.id}
                        value={o.name}
                        disabled={disabled}
                        onSelect={() => toggle(o.id)}
                      >
                        <Check
                          className={cn(
                            "size-4",
                            isSelected ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span>{o.name}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-muted-foreground text-xs tabular-nums">
        {value.length}/{max} selected
      </p>
    </div>
  );
}
