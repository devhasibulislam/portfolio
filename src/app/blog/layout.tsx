/**
 * Blog routes share the same visual system as /skills, /resume, and the
 * dashboard — no forced dark theme, no star backdrop, so the light/dark
 * toggle in the header controls the whole site consistently.
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
