"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "posts", "new"]

  // Root: /dashboard alone
  if (segments.length <= 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Overview</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const section = NAV.find((n) => n.href === `/dashboard/${segments[1]}`);
  const sectionLabel = section?.label ?? segments[1];
  const rest = segments.slice(2);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
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
        {rest.map((seg, i) => {
          const last = i === rest.length - 1;
          const label = seg === "new" ? "New" : decodeURIComponent(seg);
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
