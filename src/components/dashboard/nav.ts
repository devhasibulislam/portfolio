import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  FolderKanban,
  FolderTree,
  Images,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Sparkles,
  Tags,
} from "lucide-react";

/**
 * Dashboard nav — the single source of truth for both the sidebar (grouped)
 * and the breadcrumb resolver (flat lookup). Labels come from i18n at
 * render time; this file only carries stable keys, hrefs and icons.
 *
 * `NAV_GROUPS` drives the sidebar sections + the Overview card sections.
 * `NAV` is a flat list preserved for breadcrumb + count lookups.
 */
export type NavItemKey =
  | "overview"
  | "posts"
  | "projects"
  | "experience"
  | "skills"
  | "receipts"
  | "resume"
  | "categories"
  | "tags"
  | "media";

export type NavGroupKey = "overview" | "content" | "library";

export type NavItem = {
  key: NavItemKey;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  key: NavGroupKey;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "overview",
    items: [{ key: "overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    key: "content",
    items: [
      { key: "posts", href: "/dashboard/posts", icon: FileText },
      { key: "projects", href: "/dashboard/projects", icon: FolderKanban },
      { key: "experience", href: "/dashboard/experience", icon: Briefcase },
      { key: "skills", href: "/dashboard/skills", icon: Sparkles },
      { key: "receipts", href: "/dashboard/receipts", icon: Receipt },
      { key: "resume", href: "/dashboard/resume", icon: ScrollText },
    ],
  },
  {
    key: "library",
    items: [
      { key: "categories", href: "/dashboard/categories", icon: FolderTree },
      { key: "tags", href: "/dashboard/tags", icon: Tags },
      { key: "media", href: "/dashboard/media", icon: Images },
    ],
  },
];

// Flat list for breadcrumb section-label lookup + Overview count mapping.
// Kept as a derived export so NAV_GROUPS stays the sole edit surface.
export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
