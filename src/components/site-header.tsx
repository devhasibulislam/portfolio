"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  FolderKanban,
  MoreHorizontal,
  Rss,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandBadge } from "@/components/brand-badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Public site header. Priority-collapse nav:
 *   lg+  Resume | Projects | Experience | ⋯ More (Skills, Blogs)
 *   md   Resume | Projects | ⋯ More              (Experience → menu)
 *   sm   Resume | ⋯ More                         (Projects → menu)
 *   <sm  ⋯ (icon-only, tooltip)                  (Resume → menu)
 *
 * Skills + Blogs always live inside More — they're secondary destinations
 * and keep the top row focused on the three headline sections.
 */

type Item = {
  /** Message key under `header.nav.*` — doubles as React key. */
  key: "resume" | "projects" | "experience" | "skills" | "blog";
  href?: string;
  visibleAt: "sm" | "md" | "lg" | "xl" | null;
  icon: LucideIcon;
};

const ITEMS: Item[] = [
  { key: "resume", href: "/resume", visibleAt: "sm", icon: FileText },
  { key: "projects", href: "/projects", visibleAt: "md", icon: FolderKanban },
  { key: "experience", href: "/experience", visibleAt: "lg", icon: Briefcase },
  { key: "skills", href: "/skills", visibleAt: null, icon: Sparkles },
  { key: "blog", href: "/blog", visibleAt: null, icon: Rss },
];

// Class fragments per breakpoint kept as literal strings so Tailwind's
// static analyzer picks them up.
const SHOW: Record<NonNullable<Item["visibleAt"]>, string> = {
  sm: "hidden sm:inline-flex",
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
};
// Reverse: hide inside the menu at the breakpoint where the item joins the
// outer nav (so it never appears in both at once).
const HIDE_IN_MENU: Record<NonNullable<Item["visibleAt"]>, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/dashboard")) {
    return null;
  }

  const isActive = (href?: string) =>
    href ? pathname === href || pathname.startsWith(`${href}/`) : false;

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandBadge size="sm" />
        <ul className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-1.5 py-1 backdrop-blur">
          {ITEMS.filter((it) => it.visibleAt).map((it) => (
            <li key={it.key} className={SHOW[it.visibleAt!]}>
              <NavPill item={it} active={isActive(it.href)} />
            </li>
          ))}
          <li>
            <MoreMenu items={ITEMS} isActive={isActive} />
          </li>
        </ul>
      </nav>
    </header>
  );
}

function NavPill({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  const t = useTranslations("header.nav");
  const label = t(item.key);
  const className = cn(
    "rounded-full focus-visible:ring-0",
    active
      ? "bg-[var(--color-accent)]/20 font-semibold text-[var(--color-accent-strong)] ring-1 ring-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/25 hover:text-[var(--color-accent-strong)]"
      : "text-foreground hover:bg-transparent hover:text-[var(--color-accent)]",
  );
  if (item.href) {
    return (
      <Button variant="ghost" size="sm" asChild className={className}>
        <Link href={item.href} className="inline-flex items-center gap-1.5">
          <Icon className="size-4 shrink-0 opacity-80" />
          <span>{label}</span>
        </Link>
      </Button>
    );
  }
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex h-8 cursor-not-allowed items-center gap-1.5 rounded-full px-3 text-sm opacity-70",
      )}
      aria-disabled
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </span>
  );
}

function MoreMenu({
  items,
  isActive,
}: {
  items: Item[];
  isActive: (href?: string) => boolean;
}) {
  const t = useTranslations("header");
  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("nav.more")}
                className="text-foreground hover:text-[var(--color-accent)] gap-1.5 rounded-full hover:bg-transparent focus-visible:ring-0"
              >
                <MoreHorizontal className="size-4 shrink-0" />
                <span className="text-sm">{t("nav.more")}</span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            {t("nav.more")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 rounded-xl p-1.5"
      >
        <ul className="flex flex-col gap-0.5">
          {items.map((it) => {
            // Items that live in the outer nav at some breakpoint must hide
            // from the menu at that same breakpoint so they never duplicate.
            const hideClass = it.visibleAt ? HIDE_IN_MENU[it.visibleAt] : "";
            return (
              <li key={it.key} className={hideClass}>
                <MenuRow item={it} active={isActive(it.href)} />
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function MenuRow({ item, active }: { item: Item; active: boolean }) {
  const Icon = item.icon;
  const t = useTranslations("header.nav");
  const label = t(item.key);
  const className = cn(
    "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm transition-colors",
    active
      ? "bg-[var(--color-accent)]/20 font-semibold text-[var(--color-accent-strong)] ring-1 ring-[var(--color-accent)]/40"
      : "hover:bg-[var(--color-accent)]/10 hover:text-[var(--color-fg)]",
  );
  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        <Icon className="size-4 shrink-0 opacity-80" />
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <span
      className={cn(className, "cursor-not-allowed opacity-60")}
      aria-disabled
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
