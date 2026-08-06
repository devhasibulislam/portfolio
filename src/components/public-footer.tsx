"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Same contact endpoints as `public-floating-actions.tsx` (single-owner site,
// per PROJECT_CONTEXT §2). Kept duplicated here rather than lifted into a
// shared module because the two components use different subsets.
const SOCIALS = [
  {
    href: "https://linkedin.com/in/devhasibulislam",
    label: "LinkedIn",
    src: "/social/linkedin.webp",
  },
  {
    href: "https://github.com/devhasibulislam",
    label: "GitHub",
    src: "/social/github.webp",
  },
  {
    href: "https://facebook.com/devhasibulislam",
    label: "Facebook",
    src: "/social/facebook.webp",
  },
  {
    href: "https://youtube.com/@devhasibulislam",
    label: "YouTube",
    src: "/social/youtube.webp",
  },
  {
    href: "https://producthunt.com/@devhasibulislam",
    label: "Product Hunt",
    src: "/social/product-hunt.webp",
  },
] as const;

/**
 * Flat public footer. Renders under every public route, hidden on
 * `/dashboard*` and `/login` (matches PublicFloatingActions' hide rule).
 * One row on desktop (name + role on the start, social icons on the end),
 * wraps to two rows on narrow screens. Copyright sits under a `border-t`.
 *
 * DM channels (WhatsApp / Telegram / Email) intentionally live only in the
 * floating "Contact with Hasib" menu so the footer stays a public-presence
 * strip, not a contact form.
 */
export function PublicFooter() {
  const pathname = usePathname();
  const isPublic = pathname !== "/login" && !pathname.startsWith("/dashboard");
  if (!isPublic) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-10">
        <div className="min-w-0">
          <p className="text-foreground text-sm font-semibold">Hasibul Islam</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Senior full-stack engineer. Backend, LLM/RAG, and production
            Node.js.
          </p>
        </div>

        <ul className="flex flex-wrap items-center gap-2">
          <TooltipProvider delayDuration={150}>
            {SOCIALS.map((s) => (
              <li key={s.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="focus-visible:ring-ring inline-flex rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2"
                    >
                      <Image
                        src={s.src}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-lg"
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    {s.label}
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </TooltipProvider>
        </ul>
      </div>

      <div className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-4">
          <p className="text-muted-foreground text-xs">
            © {year} Hasibul Islam. Built with Next.js.
          </p>
          <a
            href="https://github.com/devhasibulislam/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
          >
            Source ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
