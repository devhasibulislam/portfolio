import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Sign in",
};

/**
 * Login page for the dashboard. No sign-up route, no forgot-password route.
 * Not linked from public UI — owner types /login manually.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm opacity-70">Authorized user only.</p>

      {denied ? (
        <div className="mt-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Access denied. Only the site owner can sign in.
        </div>
      ) : null}

      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  );
}
