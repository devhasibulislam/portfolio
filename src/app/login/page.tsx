import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";

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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-stretch justify-center px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>Authorized user only.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {denied ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              Access denied. Only the site owner can sign in.
            </p>
          ) : null}
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
