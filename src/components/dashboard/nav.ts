import type { LucideIcon } from "lucide-react";
import {
  FileText,
  FolderTree,
  Images,
  LayoutDashboard,
  ScrollText,
  Tags,
} from "lucide-react";

/**
 * Dashboard nav — the single source of truth for both the sidebar and the
 * breadcrumb resolver. `href` is exact-match; `matcher` matches the current
 * path segment for nested routes.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Posts", href: "/dashboard/posts", icon: FileText },
  { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
  { label: "Tags", href: "/dashboard/tags", icon: Tags },
  { label: "Media", href: "/dashboard/media", icon: Images },
  { label: "Resume", href: "/dashboard/resume", icon: ScrollText },
];
