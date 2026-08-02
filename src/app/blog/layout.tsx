import { StarBackdrop } from "@/components/star-backdrop";

/**
 * Blog routes share the same dark star-field surface as the hero (§16
 * dark-mode-first aesthetic). The backdrop is fixed and CSS-only —
 * cheap enough to ship on every blog page.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-theme="dark" className="text-[var(--color-fg)]">
      <StarBackdrop />
      {children}
    </div>
  );
}
