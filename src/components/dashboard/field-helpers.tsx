"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const len = value !== undefined ? String(value).length : uncontrolledLen;

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
  const len = value !== undefined ? String(value).length : uncontrolledLen;

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

/* ------------------------------- form layout ------------------------------ */

/**
 * Dialog form section wrapper. Renders a small uppercase heading over the
 * child fields; the optional `action` slot lets a section add a Row-level
 * button (used by the Projects Links section to add rows).
 */
export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Two-column responsive form grid (grid-cols-2 gap-3). */
export function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

/**
 * Labelled form field. `required` renders a red asterisk; `optional`
 * renders a muted "(optional)" marker. `hint` sits under the field in
 * muted text.
 */
export function Field({
  htmlFor,
  label,
  hint,
  className,
  required,
  optional,
  children,
}: {
  htmlFor?: string;
  label: string;
  hint?: string;
  className?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <RequiredMark /> : null}
        {optional ? <OptionalMark /> : null}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

/**
 * Standard "labelled switch" row used inside form dialogs: label + hint
 * on the left, uncontrolled `<Switch name>` on the right, wrapped in a
 * bordered card. Two-column-friendly (`col-span-2`).
 */
export function SwitchRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="col-span-2 flex items-center justify-between rounded-md border p-3">
      <div>
        <Label htmlFor={name} className="cursor-pointer">
          {label}
        </Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch id={name} name={name} defaultChecked={defaultChecked} />
    </div>
  );
}
