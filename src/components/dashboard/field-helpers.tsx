"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Live character counter shown under an input/textarea. Turns amber at 90%
 * of the max, red at the ceiling. When `publishMin` is set (draft-friendly
 * SEO fields per §5), the hint reads "42 / 200 · min 80 to publish" so the
 * author sees exactly what the Zod publish gate expects.
 */
export function CharCount({
  current,
  max,
  publishMin,
  className,
}: {
  current: number;
  max: number;
  publishMin?: number;
  className?: string;
}) {
  const pct = max > 0 ? current / max : 0;
  const tone =
    pct >= 1
      ? "text-destructive"
      : pct >= 0.9
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";
  return (
    <span className={cn("text-xs tabular-nums", tone, className)}>
      {current} / {max}
      {publishMin ? ` · min ${publishMin} to publish` : ""}
    </span>
  );
}

type CountedInputProps = React.ComponentProps<typeof Input> & {
  max: number;
  publishMin?: number;
};

/**
 * `<Input>` + live character counter. Supports both controlled (`value`)
 * and uncontrolled (`defaultValue`) modes so consumers that already own
 * state (title / slug auto-derive) drop it in without a rewrite.
 */
export function CountedInput(props: CountedInputProps) {
  const { max, publishMin, value, defaultValue, onChange, ...rest } = props;
  const [uncontrolledLen, setUncontrolledLen] = useState(
    String(defaultValue ?? "").length,
  );
  const len =
    value !== undefined ? String(value).length : uncontrolledLen;

  return (
    <div className="flex flex-col gap-1">
      <Input
        {...rest}
        value={value}
        defaultValue={defaultValue}
        maxLength={max}
        onChange={(e) => {
          if (value === undefined) setUncontrolledLen(e.target.value.length);
          onChange?.(e);
        }}
      />
      <CharCount current={len} max={max} publishMin={publishMin} />
    </div>
  );
}

type CountedTextareaProps = React.ComponentProps<typeof Textarea> & {
  max: number;
  publishMin?: number;
};

export function CountedTextarea(props: CountedTextareaProps) {
  const { max, publishMin, value, defaultValue, onChange, ...rest } = props;
  const [uncontrolledLen, setUncontrolledLen] = useState(
    String(defaultValue ?? "").length,
  );
  const len =
    value !== undefined ? String(value).length : uncontrolledLen;

  return (
    <div className="flex flex-col gap-1">
      <Textarea
        {...rest}
        value={value}
        defaultValue={defaultValue}
        maxLength={max}
        onChange={(e) => {
          if (value === undefined) setUncontrolledLen(e.target.value.length);
          onChange?.(e);
        }}
      />
      <CharCount current={len} max={max} publishMin={publishMin} />
    </div>
  );
}

/**
 * Field-required marker. Red asterisk after the label — matches WCAG H90
 * (Marking required fields). Consumers write `Title <RequiredMark />`.
 */
export function RequiredMark() {
  return (
    <span
      className="text-destructive ms-0.5"
      aria-label="required"
      title="Required"
    >
      *
    </span>
  );
}

/**
 * Optional marker — muted "(optional)" so users know the field can be
 * left blank without hunting through validation errors.
 */
export function OptionalMark() {
  return (
    <span className="text-muted-foreground ms-1 text-xs font-normal">
      (optional)
    </span>
  );
}
