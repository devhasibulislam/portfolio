"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  Briefcase,
  FileText,
  FolderKanban,
  MessageSquareQuote,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
 *   xl+  Resume | Projects | Experiences | Blogs | ⋯ More
 *   lg   Resume | Projects | Experiences | ⋯ More  (Blogs → menu)
 *   md   Resume | Projects | ⋯ More                (Experiences → menu)
 *   sm   Resume | ⋯ More                           (Projects → menu)
 *   <sm  ⋯ (icon-only, tooltip)                    (Resume → menu)
 *
 * Skills / Certifications / Testimonials always live inside the menu —
 * they'll open shadcn Sheets once the owner wires them up.
 */

type Item = {
  key: string;
  label: string;
  href?: string; // absent = placeholder no-op (owner will wire later)
  visibleAt: "sm" | "md" | "lg" | "xl" | null;
  icon: LucideIcon;
};

const ITEMS: Item[] = [
  {
    key: "resume",
    label: "Resume",
    href: "/resume",
    visibleAt: "sm",
    icon: FileText,
  },
  { key: "projects", label: "Projects", visibleAt: "md", icon: FolderKanban },
  {
    key: "experiences",
    label: "Experiences",
    visibleAt: "lg",
    icon: Briefcase,
  },
  {
    key: "blogs",
    label: "Blogs",
    href: "/blog",
    visibleAt: "xl",
    icon: BookOpen,
  },
  { key: "skills", label: "Skills", visibleAt: null, icon: Sparkles },
  {
    key: "certifications",
    label: "Certifications",
    visibleAt: null,
    icon: Award,
  },
  {
    key: "testimonials",
    label: "Testimonials",
    visibleAt: null,
    icon: MessageSquareQuote,
  },
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
  // Active   = accent-tinted pill.
  // Inactive = normal foreground text (white on dark, dark on light).
  // Disabled placeholders below get their own muted styling.
  const className = cn(
    "rounded-full focus-visible:ring-0",
    active
      ? "bg-[var(--color-accent)]/20 font-semibold text-[var(--color-accent-strong)] ring-1 ring-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/25 hover:text-[var(--color-accent-strong)]"
      : "text-foreground hover:bg-transparent hover:text-[var(--color-accent)]",
  );
  if (item.href) {
    return (
      <Button variant="ghost" size="sm" asChild className={className}>
        <Link href={item.href}>{item.label}</Link>
      </Button>
    );
  }
  // Placeholder items (Projects / Experiences until sheets are wired) —
  // greyed out so the row visually distinguishes routable vs pending items.
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex h-8 cursor-not-allowed items-center rounded-full px-3 text-sm opacity-70",
      )}
      aria-disabled
    >
      {item.label}
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
  return (
    <Popover>
      <TooltipProvider>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Click to see all items"
                className="text-foreground hover:text-[var(--color-accent)] gap-1.5 rounded-full hover:bg-transparent focus-visible:ring-0"
              >
                <MoreHorizontal className="size-4" />
                <span className="hidden sm:inline text-xs uppercase tracking-widest">
                  More
                </span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            Click to see all items
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
        <span>{item.label}</span>
      </Link>
    );
  }
  return (
    <span
      className={cn(className, "cursor-not-allowed opacity-60")}
      aria-disabled
    >
      <Icon className="size-4 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
}
