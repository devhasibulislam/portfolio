"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NAV } from "./nav";

/**
 * Breadcrumb derived from the current pathname + NAV. Simple two-level:
 * `Dashboard` → current section (Posts, Media…) → optional final crumb.
 * For deeper routes (e.g. /dashboard/posts/[id]/edit) the last segment is
 * displayed as a plain page crumb.
 */
export function DashboardBreadcrumb() {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "posts", "new"]

  // Root: /dashboard alone
  if (segments.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t("breadcrumb.overview")}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const section = NAV.find((n) => n.href === `/dashboard/${segments[1]}`);
  const sectionLabel = section
    ? t(`nav.items.${section.key}`)
    : segments[1];
  const rest = segments.slice(2);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">{t("breadcrumb.root")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {rest.length === 0 ? (
            <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/${segments[1]}`}>{sectionLabel}</Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {rest
          .filter((seg) => !isUuid(seg))
          .map((seg, i, arr) => {
            const last = i === arr.length - 1;
            const label =
              seg === "new" ? t("breadcrumb.new") : decodeURIComponent(seg);
            return (
              <span key={`${seg}-${i}`} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {last ? (
                    <BreadcrumbPage className="capitalize">
                      {label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        href={`/${segments.slice(0, 2 + i + 1).join("/")}`}
                        className="capitalize"
                      >
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(s: string) {
  return UUID_RE.test(s);
}
