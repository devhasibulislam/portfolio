"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
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
 * Chip-inline multi-picker. Chips and the text input share one flex-wrap row
 * — new chips push the input to the next line when the row overflows.
 *
 * Interaction:
 *   - Typing filters suggestions in a Radix Popover anchored to the field
 *     (auto-flips on collision).
 *   - Enter/comma picks the highlighted suggestion. If there's no match, the
 *     keystroke is ignored (we don't create loose tags — the owner manages
 *     the catalog on the Tags page).
 *   - ArrowDown / ArrowUp cycles suggestions.
 *   - Backspace on an empty input removes the last chip.
 *   - Click a chip's × to remove it individually.
 */
export function TagMultiPicker({ options, value, onChange, max = 8 }: Props) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = useMemo(() => new Set(value), [value]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as TagOption[];
    return options
      .filter(
        (o) => !selectedIds.has(o.id) && o.name.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [options, selectedIds, query]);

  const atMax = value.length >= max;

  const pick = (opt: TagOption) => {
    if (atMax) return;
    onChange([...value, opt.id]);
    setQuery("");
    setActiveIdx(0);
    inputRef.current?.focus();
  };

  const removeAt = (idx: number) => {
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (suggestions[activeIdx]) {
        e.preventDefault();
        pick(suggestions[activeIdx]);
      } else {
        // No match to commit — swallow so the comma doesn't land in the text.
        e.preventDefault();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(suggestions.length - 1, 0)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      removeAt(value.length - 1);
    }
  };

  return (
    <Popover open={open && suggestions.length > 0} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="flex flex-col gap-1.5">
          {/* Single input surface: chips + text input on one wrapping row. */}
          <div
            className={cn(
              "border-input focus-within:border-ring focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 shadow-xs transition-[color,box-shadow] focus-within:ring-[3px]",
              atMax && "cursor-not-allowed opacity-95",
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {value.map((id, idx) => {
              const opt = options.find((o) => o.id === id);
              if (!opt) return null;
              return (
                <span
                  key={id}
                  className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
                >
                  {opt.name}
                  <button
                    type="button"
                    aria-label={`Remove ${opt.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(idx);
                    }}
                    className="hover:text-primary/70"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              );
            })}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIdx(0);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              onKeyDown={onKeyDown}
              disabled={atMax}
              placeholder={
                atMax
                  ? `Max ${max} tags`
                  : value.length === 0
                    ? "Type a tag…"
                    : ""
              }
              // flex-1 so the input takes remaining space in the row; min-w-24
              // keeps it usable even with a lot of chips before it wraps.
              className="placeholder:text-muted-foreground min-w-24 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            {value.length}/{max} · Enter or comma to add
          </p>
        </div>
      </PopoverAnchor>

      {/* Suggestion panel — auto-flips vertically on collision (Radix). Not
          focus-stealing so the input keeps focus while arrowing through. */}
      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-1"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul>
          {suggestions.map((o, i) => (
            <li key={o.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                onMouseEnter={() => setActiveIdx(i)}
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-start text-sm",
                  i === activeIdx
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground",
                )}
              >
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
