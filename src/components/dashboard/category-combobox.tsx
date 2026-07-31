"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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

type Option = { id: string; name: string };

type Props = {
  options: Option[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
};

/**
 * Searchable single-select. cmdk filters the list as you type, so 100+
 * categories work as fluently as 5. Click a row (or press Enter with it
 * highlighted) to pick; picking the currently-selected row clears it.
 * Radix Popover flips vertically on collision — see PopoverContent.
 */
export function CategoryCombobox({
  options,
  value,
  onChange,
  placeholder = "Pick a category",
}: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className={cn(!current && "text-muted-foreground")}>
            {current?.name ?? placeholder}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        // Match the trigger width; PopoverContent auto-flips on collision.
        className="w-[--radix-popover-trigger-width] p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search categories…" />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4",
                    value === null ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="text-muted-foreground">— none —</span>
              </CommandItem>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.name}
                  onSelect={() => {
                    onChange(o.id === value ? null : o.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value === o.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
