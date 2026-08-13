import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-7xl font-bold tracking-tighter">404</h1>
      <p className="text-muted-foreground text-lg">{t("notFoundTitle")}</p>
      <Link
        href="/"
        className="text-primary underline underline-offset-4 hover:no-underline"
      >
        Go home
      </Link>
    </main>
  );
}
