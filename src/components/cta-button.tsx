import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Single site-wide CTA button. Two variants, both from the hero — the
 * "button-in-button" orange pill (primary) and the outlined pill with a
 * lead icon (secondary). Renders as a Link when `href` is given,
 * otherwise a plain button so it can also stand in for a form action.
 */
type CtaButtonProps = {
  variant?: "primary" | "secondary";
  href?: string;
  external?: boolean;
  download?: string | boolean;
  leadIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function CtaButton({
  variant = "primary",
  href,
  external,
  download,
  leadIcon,
  className,
  children,
}: CtaButtonProps) {
  const primary =
    "group h-12 gap-3 rounded-full bg-[var(--color-accent)] pe-1.5 ps-6 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-[0_0_0_1px_rgba(232,107,28,0.35),0_8px_28px_-6px_rgba(232,107,28,0.55)] transition-[background-color,transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[var(--color-accent-strong)] hover:shadow-[0_0_0_1px_rgba(232,107,28,0.5),0_10px_32px_-6px_rgba(232,107,28,0.7)] active:scale-[0.98]";
  const secondary =
    "group h-12 gap-3 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/40 ps-1.5 pe-6 text-sm font-medium text-[var(--color-fg)] backdrop-blur transition-colors hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-bg)]/60 hover:text-[var(--color-accent)]";

  const cls = cn(variant === "primary" ? primary : secondary, className);

  const inner =
    variant === "primary" ? (
      <>
        {children}
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-strong)] text-[color:var(--primary-foreground)] ring-1 ring-inset ring-white/15 transition-[background-color,color,transform] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:bg-[color:var(--primary-foreground)] group-hover:text-[var(--color-accent)] group-hover:ring-transparent">
          <ArrowRight className="size-4" />
        </span>
      </>
    ) : (
      <>
        {leadIcon ? (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/80 text-[var(--color-fg)] transition-colors group-hover:border-[var(--color-accent)]/40 group-hover:text-[var(--color-accent)]">
            {leadIcon}
          </span>
        ) : null}
        {children}
      </>
    );

  const linkProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  const buttonProps: React.ComponentProps<typeof Button> = {
    asChild: true,
    size: "lg",
    className: cls,
    ...(variant === "secondary" ? { variant: "ghost" as const } : {}),
  };

  return (
    <Button {...buttonProps}>
      {href ? (
        download !== undefined ? (
          <a
            href={href}
            download={download === true ? "" : download}
            rel="noopener"
            {...linkProps}
          >
            {inner}
          </a>
        ) : (
          <Link href={href} {...linkProps}>
            {inner}
          </Link>
        )
      ) : (
        <span>{inner}</span>
      )}
    </Button>
  );
}
