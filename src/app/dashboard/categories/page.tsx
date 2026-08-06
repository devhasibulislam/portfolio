import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SlugEntityTable } from "@/components/dashboard/slug-entity-table";
import { listCategoriesWithCount } from "@/lib/db/queries/categories";
import { deleteCategory, saveCategory } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("categories") };
}

export default async function Page() {
  const [rows, tNav, tPage] = await Promise.all([
    listCategoriesWithCount(),
    getTranslations("dashboard.nav.items"),
    getTranslations("dashboard.pages.categories"),
  ]);
  return (
    <SlugEntityTable
      rows={rows}
      entity={tNav("categories")}
      entityPlural={tNav("categories")}
      subtitle={tPage("subtitle")}
      slugMaxLen={30}
      saveAction={saveCategory}
      deleteAction={deleteCategory}
      toastNamespace="actions.categories"
    />
  );
}
