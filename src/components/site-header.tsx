"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandBadge } from "@/components/brand-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Public site header. Renders on `/`, `/blog*`, `/resume`. Hidden on the
 * dashboard and `/login`.
 */
export function SiteHeader() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname.startsWith("/dashboard")) {
    return null;
  }

  const items = [
    { href: "/blog", label: "Blog" },
    { href: "/resume", label: "Resume" },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-30 w-full backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <BrandBadge size="sm" />
        <ul className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-1.5 py-1 backdrop-blur">
          {items.map((it) => (
            <li key={it.href}>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "rounded-full",
                  isActive(it.href) &&
                    "bg-[var(--color-accent)]/15 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)]",
                )}
              >
                <Link href={it.href}>{it.label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
