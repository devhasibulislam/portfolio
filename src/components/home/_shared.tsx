import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "./scroll-reveal";

/**
 * Shared home-page primitives. Extracted after the initial polish pass
 * revealed 5 sections re-implementing the same double-bezel, arrow pill,
 * and eyebrow/title header — so a single hover-ring tweak had to be edited
 * in five places. Everything visible on the home page renders through one
 * of these four components:
 *
 *   <Bezel>          — outer ring + inner card, optional link/anchor
 *   <ArrowPill>      — hover-drift arrow-in-circle used on card footers
 *   <SectionHeader>  — eyebrow + h2 (+ optional action slot for "See all →")
 *   <FeaturedGrid>   — DB-driven top-3 grid with adaptive column count
 *   <MediaCard>      — cover + eyebrow + title + excerpt + footer card
 *
 * These are project-local (§14 — no cross-page abstraction until a second
 * page needs the same shape). If /projects or /blog ever wants the same
 * card, move to `src/components/cards/*` and update callers.
 */

// ---------- <Bezel> ------------------------------------------------------

type BezelProps = {
  /** If set, the shell renders as a link/anchor with hover-lift affordance. */
  href?: string;
  /** External link — adds `target="_blank"` and rel noopener. */
  external?: boolean;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
};

/**
 * Double-bezel nested card shell per the high-end-visual-design skill:
 * outer ring hairline + inner card with soft inner highlight, concentric
 * border radii (2rem outer, calc(2rem - 6px) inner). When `href` is set
 * the outer wrapper is a link with a hover lift + brand-orange shadow —
 * the whole card reads as clickable without a custom cursor.
 */
export function Bezel({
  href,
  external,
  className,
  innerClassName,
  children,
}: BezelProps) {
  const outerClass = cn(
    "block h-full rounded-[2rem] bg-[var(--color-bg)]/40 p-1.5 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
    href &&
      "group hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-15px_rgba(232,107,28,0.25)] hover:ring-[var(--color-accent)]/50",
    className,
  );
  const innerClass = cn(
    "relative flex h-full flex-col rounded-[calc(2rem-0.375rem)] bg-[var(--card)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    innerClassName,
  );
  const inner = <div className={innerClass}>{children}</div>;

  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={outerClass}
      >
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={outerClass}>
        {inner}
      </Link>
    );
  }
  return <div className={outerClass}>{inner}</div>;
}

// ---------- <ArrowPill> --------------------------------------------------

/**
 * Trailing arrow-in-circle used on every card footer and contact row. On
 * `group` hover it drifts diagonally and the ring tints orange — the
 * "you can click this" signal. `shrink-0` guards against flex-squish that
 * turned the circle into an oval on tight rows before extraction.
 */
export function ArrowPill({
  size = 7,
  className,
}: {
  size?: 7 | 8;
  className?: string;
}) {
  const dimension = size === 8 ? "size-8" : "size-7";
  const iconSize = size === 8 ? "size-4" : "size-3.5";
  return (
    <span
      className={cn(
        dimension,
        "inline-flex shrink-0 items-center justify-center rounded-full bg-[var(--color-bg)]/60 ring-1 ring-[var(--color-border)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:ring-[var(--color-accent)]/50",
        className,
      )}
    >
      <ArrowUpRight
        className={cn(
          iconSize,
          "text-[var(--color-fg)]/80 transition-colors group-hover:text-[var(--color-accent)]",
        )}
      />
    </span>
  );
}

// ---------- <SectionHeader> ----------------------------------------------

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  id: string;
  /** Optional action node (usually a "See all →" link). Rendered at the
   *  end of a flex row so the header aligns with an inline archive link. */
  action?: React.ReactNode;
  className?: string;
};

/**
 * Section header — orange eyebrow + display h2. When `action` is passed
 * the two blocks sit on a flex row so the archive link lives beside the
 * title on desktop; without an action the title stacks in a max-w-2xl
 * column. Marks its children as `data-reveal` targets so a parent
 * `<ScrollReveal stagger>` picks them up automatically.
 */
export function SectionHeader({
  eyebrow,
  title,
  id,
  action,
  className,
}: SectionHeaderProps) {
  if (action) {
    return (
      <div
        className={cn(
          "mb-14 flex flex-wrap items-end justify-between gap-6",
          className,
        )}
      >
        <div data-reveal className="max-w-2xl">
          <p className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]">
            {eyebrow}
          </p>
          <h2
            id={id}
            className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
          >
            {title}
          </h2>
        </div>
        <div data-reveal>{action}</div>
      </div>
    );
  }
  return (
    <div data-reveal className={cn("mb-14 max-w-2xl", className)}>
      <p className="text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-[0.28em]">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl"
      >
        {title}
      </h2>
    </div>
  );
}

// ---------- <SeeAllLink> -------------------------------------------------

/** Small reusable "See all X →" link for the action slot of SectionHeader. */
export function SeeAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-fg)] transition-colors hover:text-[var(--color-accent)]"
    >
      {label}
      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

// ---------- <FeaturedGrid> -----------------------------------------------

type FeaturedGridProps<T> = {
  eyebrow: string;
  title: string;
  titleId: string;
  seeAllHref: string;
  seeAllLabel: string;
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
};

/**
 * DB-driven featured grid — the /projects and /blog home-page teasers.
 * Renders section header + adaptive-column grid + item map. Column count
 * follows content count so a single card doesn't sit stranded in a
 * 3-column layout: 1-item stays left-aligned at max-w-md, 2 items become
 * 2 cols on tablet, 3+ become 2 on tablet and 3 on desktop.
 */
export function FeaturedGrid<T>({
  eyebrow,
  title,
  titleId,
  seeAllHref,
  seeAllLabel,
  items,
  keyOf,
  renderCard,
}: FeaturedGridProps<T>) {
  const gridCols =
    items.length === 1
      ? "grid-cols-1 max-w-md"
      : items.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <ScrollReveal stagger={0.08}>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          id={titleId}
          action={<SeeAllLink href={seeAllHref} label={seeAllLabel} />}
        />
      </ScrollReveal>

      <ScrollReveal as="ul" className={`grid gap-6 ${gridCols}`} stagger={0.1}>
        {items.map((item) => (
          <li key={keyOf(item)} data-reveal>
            {renderCard(item)}
          </li>
        ))}
      </ScrollReveal>
    </>
  );
}

// ---------- <MediaCard> --------------------------------------------------

type MediaCardProps = {
  href: string;
  coverUrl: string | null;
  coverWidth?: number | null;
  coverHeight?: number | null;
  coverAlt: string;
  categoryLabel: string;
  fallbackLabel: string;
  title: string;
  excerpt: string;
  /** Bottom-left slot — usually category tag (projects) or `<time>` (posts). */
  footerLeft: React.ReactNode;
};

/**
 * Cover-image + text card used by both featured projects and featured
 * writing. When there's a cover the image sits at the top at 16:10; when
 * absent, a navy-to-ink gradient with the fallback label reads as a
 * "no image yet" placeholder rather than a broken tile. Card bottom
 * (`mt-auto pt-6`) anchors the footer row so heights align across the row
 * regardless of excerpt length.
 */
export function MediaCard({
  href,
  coverUrl,
  coverWidth,
  coverHeight,
  coverAlt,
  categoryLabel,
  fallbackLabel,
  title,
  excerpt,
  footerLeft,
}: MediaCardProps) {
  return (
    <Bezel href={href} innerClassName="overflow-hidden">
      <div className="bg-muted relative aspect-[16/10] w-full overflow-hidden">
        {coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={coverUrl}
            alt={coverAlt}
            width={coverWidth ?? 900}
            height={coverHeight ?? 560}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[var(--color-brand-navy)] to-[var(--color-brand-ink)]">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-fg)]/40">
              {fallbackLabel}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          {categoryLabel}
        </p>
        <h3 className="mt-3 text-lg font-semibold leading-tight tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-3 text-sm leading-relaxed">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-6">
          {footerLeft}
          <ArrowPill size={7} />
        </div>
      </div>
    </Bezel>
  );
}
