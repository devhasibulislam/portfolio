import { SlugEntityTable } from "@/components/dashboard/slug-entity-table";
import { listCategoriesWithCount } from "@/lib/db/queries/categories";
import { deleteCategory, saveCategory } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function Page() {
  const rows = await listCategoriesWithCount();
  return (
    <SlugEntityTable
      rows={rows}
      entity="Category"
      entityPlural="Categories"
      subtitle="One per post. Deleting one used by a post is blocked."
      slugMaxLen={30}
      saveAction={saveCategory}
      deleteAction={deleteCategory}
    />
  );
}
