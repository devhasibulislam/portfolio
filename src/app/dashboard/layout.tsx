import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardBreadcrumb } from "@/components/dashboard/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic"; // auth.getSession() reads cookies

/**
 * Dashboard shell. proxy.ts already blocks unauthenticated access; this layout
 * adds the defence-in-depth *single-user email whitelist* required by §11.
 * Any session whose email !== DASHBOARD_ALLOWED_EMAIL is signed out and
 * bounced to /login.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();
  const allowed = process.env.DASHBOARD_ALLOWED_EMAIL;

  if (!session?.user || !allowed || session.user.email !== allowed) {
    // Defensive: if proxy.ts lets a foreign session through, kill it here.
    if (session?.user) {
      try {
        await auth.signOut();
      } catch {
        /* ignore — we're about to redirect regardless */
      }
    }
    redirect("/login?denied=1");
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={session.user.email} />
      <SidebarInset>
        <header className="bg-background/70 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 h-4" />
          <DashboardBreadcrumb />
        </header>
        <div className="flex-1">{children}</div>
        <Toaster richColors closeButton position="top-right" />
      </SidebarInset>
    </SidebarProvider>
  );
}
