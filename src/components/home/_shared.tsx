import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";
import { Spotlight } from "./spotlight";

/**
 * Shared building blocks for the home page sections. Extracted after a
 * ponytail-review flagged 5 verbatim copies of the double-bezel shell,
 * 5 copies of the section header block, and 4 copies of the arrow-in-pill
 * footer. One tweak to any of these now lives in one place.
 */

// Card shell — subtle static border by default, brightens softly to the
// accent hue on hover. No visible outer padding; the inner surface fills
// the shell so the Spotlight glow reads as ambient card lighting.
export const bezelOuter =
  "rounded-[2rem] ring-1 ring-[var(--color-border)]/40 transition-[box-shadow,transform,border-color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/spot:ring-[var(--color-accent)]/25";

export const bezelInner =
  "rounded-[2rem] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

// Extra lift for interactive (linked) cards on hover.
const bezelHover =
  "group-hover/spot:-translate-y-0.5 group-hover/spot:shadow-[0_20px_50px_-15px_rgba(232,107,28,0.25)]";

export function BezelLink({
  href,
  external,
  className,
  innerClassName,
  children,
}: {
  href: string;
  external?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  const linkProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};
  return (
    <Spotlight className="h-full">
      <Link
        href={href}
        {...linkProps}
        className={cn("group block h-full", bezelOuter, bezelHover, className)}
      >
        <div className={cn("flex h-full flex-col", bezelInner, innerClassName)}>
          {children}
        </div>
      </Link>
    </Spotlight>
  );
}

// Trailing arrow-in-circle. `size` is the Tailwind size-N number.
export function ArrowPill({ size = 7 }: { size?: 7 | 8 }) {
  const sizeCls = size === 8 ? "size-8" : "size-7";
  const iconCls = size === 8 ? "size-4" : "size-3.5";
  return (
    <span
      className={cn(
        sizeCls,
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)]/60 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:ring-[var(--color-accent)]/50",
      )}
    >
      <ArrowUpRight
        className={cn(
          iconCls,
          "text-[var(--color-fg)]/80 transition-colors group-hover:text-[var(--color-accent)]",
        )}
      />
    </span>
  );
}

export function SectionHeader({
  title,
  id,
  action,
  intro,
}: {
  title: string;
  id: string;
  action?: React.ReactNode;
  intro?: string;
}) {
  return (
    <ScrollReveal
      className={
        action
          ? "mb-14 flex flex-wrap items-end justify-between gap-6"
          : "mb-14 max-w-2xl"
      }
      stagger={0.08}
    >
      <div data-reveal className="max-w-2xl">
        <h2
          id={id}
          className="text-3xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[3.25rem]"
        >
          {title}
        </h2>
        {intro ? (
          <p className="text-muted-foreground mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
            {intro}
          </p>
        ) : null}
      </div>
      {action}
    </ScrollReveal>
  );
}

export function SeeAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-[var(--card)]/60 py-2.5 pe-2.5 ps-5 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-accent)]"
    >
      {label}
      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[var(--color-accent)]/15 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-[var(--color-accent)]/30">
        <ArrowRight className="size-3.5 text-[var(--color-accent)]" />
      </span>
    </Link>
  );
}

// Media card used by both featured projects and featured writing. Cover
// image (or gradient placeholder), category eyebrow, title, line-clamp
// body, and a footer row with caller-supplied left slot + trailing arrow.
export function MediaCard({
  href,
  category,
  title,
  body,
  cover,
  coverWidth,
  coverHeight,
  footerLeft,
}: {
  href: string;
  category: string;
  title: string;
  body: string;
  cover: string | null;
  coverWidth?: number | null;
  coverHeight?: number | null;
  footerLeft: React.ReactNode;
}) {
  return (
    <BezelLink href={href} className="overflow-hidden">
      <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
        {cover ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={cover}
            alt={title}
            width={coverWidth ?? 900}
            height={coverHeight ?? 560}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--color-brand-navy)] to-[var(--color-brand-ink)]">
            <span className="text-sm text-[var(--color-fg)]/50">
              {category}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-medium text-[var(--color-accent)]">
          {category}
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-balance">
          {title}
        </h3>
        <p className="text-muted-foreground mt-3 line-clamp-3 text-base leading-relaxed">
          {body}
        </p>
        <div className="mt-auto flex items-center justify-between pt-6">
          {footerLeft}
          <ArrowPill size={7} />
        </div>
      </div>
    </BezelLink>
  );
}

// Grid column classes that adapt to row count so short lists don't strand
// a lone card in the middle of a wide 3-column layout.
export function featuredGridCols(count: number): string {
  if (count === 1) return "grid-cols-1 max-w-md";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}
