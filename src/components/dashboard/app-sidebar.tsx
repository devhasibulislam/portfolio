"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { signOutAction } from "@/lib/auth/actions";
import { NAV } from "./nav";

// Sidebar has no props — the header is a static brand badge (avatar + name).
export function AppSidebar() {
  const pathname = usePathname();
  // Close the mobile drawer after a nav click — otherwise the sheet stays
  // open, overlaying the newly-navigated route until the user dismisses it.
  const { isMobile, setOpenMobile } = useSidebar();
  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Brand row: matches the nav-item pattern (asChild + Link +
                tooltip) so it collapses to just the avatar when the sidebar
                is icon-only, and shows the name in a tooltip. */}
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Hasibul Islam"
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
                  Hasibul Islam
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(({ label, href, icon: Icon }) => {
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
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Use the same primitive as the nav rows so the tooltip appears
                on hover when the sidebar is collapsed, and the icon column
                stays aligned. The <form> wraps the button so the sign-out
                server action fires on click. */}
            <form action={signOutAction}>
              <SidebarMenuButton
                type="submit"
                tooltip="Sign out"
                className="w-full"
              >
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
