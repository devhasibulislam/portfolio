"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSelect } from "@/components/language-select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { DIRECTION, type Locale } from "@/lib/i18n/config";
import { signOutAction } from "@/lib/auth/actions";
import { NAV_GROUPS } from "./nav";

// Sidebar has no props — the header is a static brand badge (avatar + name).
export function AppSidebar() {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const tBrand = useTranslations("brand");
  const tDash = useTranslations("dashboard");
  const name = tBrand("name");
  // Flip the sidebar to the trailing edge in RTL locales so it matches the
  // rest of the RTL layout. shadcn's Sidebar component has native support
  // for this via the `side` prop.
  const side = DIRECTION[locale] === "rtl" ? "right" : "left";
  // Close the mobile drawer after a nav click — otherwise the sheet stays
  // open, overlaying the newly-navigated route until the user dismisses it.
  const { isMobile, setOpenMobile } = useSidebar();
  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" side={side}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Brand row: matches the nav-item pattern (asChild + Link +
                tooltip) so it collapses to just the avatar when the sidebar
                is icon-only, and shows the name in a tooltip. */}
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip={name}
              className="gap-2 hover:bg-transparent active:bg-transparent"
            >
              <Link href="/dashboard" onClick={closeIfMobile}>
                <Avatar className="size-8 shrink-0">
                  <AvatarImage src="/brand/hasibul.jpg" alt="" />
                  <AvatarFallback className="bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-sm font-semibold">
                    H
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-base font-semibold tracking-tight">
                  {name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>
              {tDash(`nav.groups.${group.key}`)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ key, href, icon: Icon }) => {
                  const label = tDash(`nav.items.${key}`);
                  const active =
                    href === "/dashboard"
                      ? pathname === href
                      : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={label}
                      >
                        <Link href={href} onClick={closeIfMobile}>
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2">
          <LanguageSelect align="start" className="h-8 w-full text-xs" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Use the same primitive as the nav rows so the tooltip appears
                on hover when the sidebar is collapsed, and the icon column
                stays aligned. The <form> wraps the button so the sign-out
                server action fires on click. */}
            <form action={signOutAction}>
              <SidebarMenuButton
                type="submit"
                tooltip={tDash("signOut")}
                className="w-full"
              >
                <LogOut />
                <span>{tDash("signOut")}</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
