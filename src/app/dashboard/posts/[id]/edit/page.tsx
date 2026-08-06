import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { PostForm } from "@/components/dashboard/post-form";
import {
  getPostForEdit,
  listCategoriesForPicker,
  listMediaForPicker,
  listTagsForPicker,
} from "@/lib/db/queries/posts";

export async function generateMetadata(): Promise<Metadata> {
  const tCommon = await getTranslations("dashboard.forms.common");
  const tNav = await getTranslations("dashboard.nav.items");
  return { title: `${tCommon("update")} — ${tNav("posts")}` };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [post, categories, tags, media] = await Promise.all([
    getPostForEdit(id),
    listCategoriesForPicker(),
    listTagsForPicker(),
    listMediaForPicker(),
  ]);
  if (!post) notFound();
  return (
    <PostForm
      post={post}
      categories={categories}
      tags={tags}
      media={media}
      savedFlash={saved === "1"}
    />
  );
}
