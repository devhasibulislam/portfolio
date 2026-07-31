"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/sidebar";
import { signOutAction } from "@/lib/auth/actions";
import { NAV } from "./nav";

type Props = { userEmail: string };

export function AppSidebar({ userEmail }: Props) {
  const pathname = usePathname();
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
                      <Link href={href}>
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
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="me-2 size-4" />
            <span className="group-data-[collapsible=icon]:hidden">
              Sign out
            </span>
          </Button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
