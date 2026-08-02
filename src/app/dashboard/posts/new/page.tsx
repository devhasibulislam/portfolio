import { PostForm } from "@/components/dashboard/post-form";
import {
  listCategoriesForPicker,
  listMediaForPicker,
  listTagsForPicker,
} from "@/lib/db/queries/posts";

export const metadata = { title: "New post" };

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
