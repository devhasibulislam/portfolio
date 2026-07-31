"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TagOption = { id: string; name: string };

type Props = {
  options: TagOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
};

/**
 * Chip-style multi-picker. Search filters remaining options; click adds a chip.
 * Enforces a soft max — button + input disable at limit, error toast up to
 * caller.
 */
export function TagMultiPicker({ options, value, onChange, max = 8 }: Props) {
  const [query, setQuery] = useState("");
  const selectedIds = useMemo(() => new Set(value), [value]);
  const remaining = useMemo(
    () =>
      options.filter(
        (o) =>
          !selectedIds.has(o.id) &&
          o.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [options, selectedIds, query],
  );
  const atMax = value.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-md border px-2 py-1.5">
        {value.length === 0 ? (
          <span className="text-muted-foreground text-sm">No tags</span>
        ) : null}
        {value.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <span
              key={id}
              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
            >
              {opt.name}
              <button
                type="button"
                aria-label={`Remove ${opt.name}`}
                onClick={() => onChange(value.filter((v) => v !== id))}
                className="hover:text-foreground/90"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder={atMax ? `Max ${max} tags` : "Search tags…"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={atMax}
          className="max-w-xs"
        />
        <span className="text-muted-foreground text-xs">
          {value.length}/{max}
        </span>
      </div>

      {!atMax && query.trim() ? (
        <ul className="rounded-md border p-1">
          {remaining.length === 0 ? (
            <li className="text-muted-foreground px-2 py-1 text-sm">
              No matches. Create the tag on the Tags page.
            </li>
          ) : (
            remaining.slice(0, 8).map((o) => (
              <li key={o.id}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    onChange([...value, o.id]);
                    setQuery("");
                  }}
                >
                  {o.name}
                </Button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
