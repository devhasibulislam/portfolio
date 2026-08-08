import { CldImage } from "next-cloudinary";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/** Company name + logo pill matching the BrandBadge shape. */
export function CompanyChip({
  name,
  logoPublicId,
  size = "sm",
  className,
}: {
  name: string;
  logoPublicId: string | null;
  size?: "sm" | "md";
  className?: string;
}) {
  const avatarSize = size === "md" ? "size-7" : "size-5";
  const textSize = size === "md" ? "text-sm" : "text-xs";
  const px = size === "md" ? 56 : 40;
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/70 ps-1 pe-3 py-1 shadow-sm backdrop-blur",
        className,
      )}
    >
      <Avatar className={avatarSize}>
        {logoPublicId ? (
          <CldImage
            src={logoPublicId}
            alt=""
            width={px}
            height={px}
            crop="fill"
            gravity="auto"
            className="size-full object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-[10px] font-semibold">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className={cn("font-semibold tracking-tight", textSize)}>
        {name}
      </span>
    </span>
  );
}
