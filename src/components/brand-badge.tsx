import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Reusable brand logo: avatar + "Hasibul Islam" wordmark. Used in the
 * public `SiteHeader` and the dashboard `SidebarHeader`. The Avatar
 * fallback "H" renders until the photo loads, so the slot always reads
 * like an image even before the file is available.
 */
export function BrandBadge({
  size = "sm",
  asLink = true,
  className,
}: {
  size?: "sm" | "lg";
  asLink?: boolean;
  className?: string;
}) {
  const avatarSize = size === "lg" ? "size-8" : "size-7";
  const textSize = size === "lg" ? "text-base" : "text-sm";
  const inner = (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 ps-1 pe-3 py-1 shadow-sm backdrop-blur transition-colors hover:border-[var(--color-accent)]/50",
        className,
      )}
    >
      <Avatar className={avatarSize}>
        <AvatarImage src="/brand/hasibul.jpg" alt="" />
        <AvatarFallback className="bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-semibold">
          H
        </AvatarFallback>
      </Avatar>
      <span className={cn("font-semibold tracking-tight", textSize)}>
        Hasibul Islam
      </span>
    </span>
  );

  if (!asLink) return inner;
  return (
    <Link
      href="/"
      aria-label="Hasibul Islam — home"
      className="focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] rounded-full"
    >
      {inner}
    </Link>
  );
}
