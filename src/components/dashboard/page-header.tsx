/**
 * Standard dashboard page header. Row 1 = title + primary action button
 * (kept together at every viewport width); row 2 = description underneath,
 * capped so it never runs into the button column.
 *
 * `action` is a full `<Button>` (or `<Button asChild>` for links) so
 * consumers control label, icon, and click handler.
 */
export function PageHeader({
  title,
  description,
  action,
  className = "mb-4",
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {action}
      </div>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          {description}
        </p>
      ) : null}
    </div>
  );
}
