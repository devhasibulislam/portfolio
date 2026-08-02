"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Public site header. Renders on `/`, `/blog*`, `/resume`. Hidden on the
 * dashboard (has its own SidebarProvider header) and on `/login`.
 *
 * Fixed to the top with a soft blur backdrop so it reads over the R3F scene
 * on `/` without stealing focus. Highlights the active section.
 */
export function SiteHeader() {
  const pathname = usePathname();
  if (
    pathname === "/login" ||
    pathname.startsWith("/dashboard") ||
    pathname === "/dashboard"
  ) {
    return null;
  }

  const items = [
    { href: "/blog", label: "Blog" },
    { href: "/resume", label: "Resume" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="rounded-md text-sm font-semibold tracking-tight text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors"
          aria-label="Hasibul Islam — home"
        >
          Hasibul Islam
        </Link>
        <ul className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-1.5 py-1 text-sm backdrop-blur">
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className={`inline-flex items-center rounded-full px-3 py-1 transition-colors ${
                  isActive(it.href)
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "text-[var(--color-fg)]/75 hover:text-[var(--color-fg)]"
                }`}
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
