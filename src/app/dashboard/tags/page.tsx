import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SlugEntityTable } from "@/components/dashboard/slug-entity-table";
import { listTagsWithCount } from "@/lib/db/queries/tags";
import { deleteTag, saveTag } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.nav.items");
  return { title: t("tags") };
}

export default async function Page() {
  const [rows, tNav, tPage] = await Promise.all([
    listTagsWithCount(),
    getTranslations("dashboard.nav.items"),
    getTranslations("dashboard.pages.tags"),
  ]);
  return (
    <SlugEntityTable
      rows={rows}
      entity={tNav("tags")}
      entityPlural={tNav("tags")}
      subtitle={tPage("subtitle")}
      slugMaxLen={30}
      saveAction={saveTag}
      deleteAction={deleteTag}
      toastNamespace="actions.tags"
    />
  );
}
