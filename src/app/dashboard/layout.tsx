import { redirect } from "next/navigation";
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

  return <>{children}</>;
}
