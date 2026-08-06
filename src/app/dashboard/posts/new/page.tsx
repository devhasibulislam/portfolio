import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PostForm } from "@/components/dashboard/post-form";
import {
  listCategoriesForPicker,
  listMediaForPicker,
  listTagsForPicker,
} from "@/lib/db/queries/posts";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.pages.posts");
  return { title: t("newButton") };
}

export default async function Page() {
  const [categories, tags, media] = await Promise.all([
    listCategoriesForPicker(),
    listTagsForPicker(),
    listMediaForPicker(),
  ]);
  return (
    <PostForm post={null} categories={categories} tags={tags} media={media} />
  );
}
