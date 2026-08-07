import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type Crumb = { label: string; href?: string };

/**
 * Reusable breadcrumb for public pages. Renders Home + N crumbs; the
 * last crumb is rendered as the current page (unlinked). Translations
 * for common section labels come from `nav.*` so they follow the active
 * locale.
 */
export async function PageBreadcrumb({ trail }: { trail: Crumb[] }) {
  const t = await getTranslations("nav");

  return (
    <Breadcrumb className="mb-8">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{t("home")}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <span key={`${c.label}-${i}`} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {last || !c.href ? (
                  <BreadcrumbPage className="max-w-[24ch] truncate">
                    {c.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={c.href}>{c.label}</Link>
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
