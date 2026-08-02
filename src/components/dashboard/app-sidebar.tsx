"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type Props = { userEmail: string };

export function AppSidebar({ userEmail }: Props) {
  const pathname = usePathname();
  // Close the mobile drawer after a nav click — otherwise the sheet stays
  // open, overlaying the newly-navigated route until the user dismisses it.
  const { isMobile, setOpenMobile } = useSidebar();
  const closeIfMobile = () => {
    if (isMobile) setOpenMobile(false);
  };
  const initial = userEmail.slice(0, 1).toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Use the shadcn menu-button primitive so the avatar column lines
                up pixel-for-pixel with the nav icons when the sidebar
                collapses to icon-only. */}
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
              tooltip={userEmail}
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 leading-tight">
                <span className="truncate text-sm font-medium">
                  Portfolio CMS
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
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
