import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  FolderKanban,
  FolderTree,
  Images,
  LayoutDashboard,
  ScrollText,
  Sparkles,
  Tags,
} from "lucide-react";

/**
 * Dashboard nav — the single source of truth for both the sidebar (grouped)
 * and the breadcrumb resolver (flat lookup).
 *
 * `NAV_GROUPS` drives the sidebar sections + the Overview card sections.
 * `NAV` is a flat list preserved for breadcrumb + count lookups.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { label: "Posts", href: "/dashboard/posts", icon: FileText },
      { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
      { label: "Experience", href: "/dashboard/experience", icon: Briefcase },
      { label: "Skills", href: "/dashboard/skills", icon: Sparkles },
      { label: "Resume", href: "/dashboard/resume", icon: ScrollText },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
      { label: "Tags", href: "/dashboard/tags", icon: Tags },
      { label: "Media", href: "/dashboard/media", icon: Images },
    ],
  },
];

// Flat list for breadcrumb section-label lookup + Overview count mapping.
// Kept as a derived export so NAV_GROUPS stays the sole edit surface.
export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
