"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategoryCombobox } from "@/components/dashboard/category-combobox";
import {
  MediaPicker,
  type MediaOption,
} from "@/components/dashboard/media-picker";
import { TagMultiPicker } from "@/components/dashboard/tag-multi-picker";
import { TiptapEditor } from "@/components/dashboard/tiptap-editor";
import { slugify } from "@/lib/slug";
import { savePost } from "@/app/dashboard/posts/actions";

type Option = { id: string; name: string };

type Props = {
  post: {
    id: string;
    title: string;
    slug: string;
    metaDescription: string;
    excerpt: string;
    body: unknown;
    coverMediaId: string | null;
    categoryId: string | null;
    status: "draft" | "published";
    tagIds: string[];
  } | null;
  categories: Option[];
  tags: Option[];
  media: MediaOption[];
  savedFlash?: boolean;
};

export function PostForm({ post, categories, tags, media, savedFlash }: Props) {
  const router = useRouter();
  const t = useTranslations("actions.posts");
  const tForm = useTranslations("dashboard.forms.post");
  const tCommon = useTranslations("dashboard.forms.common");
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [metaDescription, setMetaDescription] = useState(
    post?.metaDescription ?? "",
  );
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [body, setBody] = useState<unknown>(post?.body ?? { type: "doc" });
  const [coverMediaId, setCoverMediaId] = useState<string | null>(
    post?.coverMediaId ?? null,
  );
  const [categoryId, setCategoryId] = useState<string | null>(
    post?.categoryId ?? null,
  );
  const [tagIds, setTagIds] = useState<string[]>(post?.tagIds ?? []);
  const status: "draft" | "published" = post?.status ?? "draft";
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (savedFlash) toast.success(t("saved"));
  }, [savedFlash, t]);

  const submit = (nextStatus: "draft" | "published") => {
    setError(null);
    const fd = new FormData();
    if (post) fd.set("id", post.id);
    fd.set("title", title);
    fd.set("slug", slug || slugify(title));
    fd.set("metaDescription", metaDescription);
    fd.set("excerpt", excerpt);
    fd.set("body", JSON.stringify(body ?? { type: "doc" }));
    fd.set("coverMediaId", coverMediaId ?? "");
    fd.set("categoryId", categoryId ?? "");
    for (const id of tagIds) fd.append("tagIds", id);
    fd.set("status", nextStatus);
    startTransition(async () => {
      const res = await savePost(null, fd);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
        return;
      }
      // Success: server action already redirects — but if we ever hit here,
      // do a refresh so cached data updates.
      router.refresh();
    });
  };

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="post-title">{tForm("title")}</Label>
          <Input
            id="post-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            maxLength={70}
            placeholder={tForm("titlePlaceholder")}
            className="text-lg font-medium"
            required
            autoFocus
          />
          <p className="text-muted-foreground text-xs tabular-nums">
            {tForm("titleHelper", { count: title.length })}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-body">{tForm("body")}</Label>
          <TiptapEditor value={body} onChange={setBody} mediaOptions={media} />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
      </div>

      {/* Right rail — meta + publish controls */}
      <aside className="flex flex-col gap-6">
        <div className="rounded-lg border p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">
              {status === "published" ? tCommon("published") : tCommon("draft")}
            </span>
            <span
              className={`text-xs font-medium ${
                status === "published"
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            >
              {status === "published" ? tCommon("live") : tCommon("hidden")}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {status === "published" ? (
              <>
                <Button disabled={pending} onClick={() => submit("published")}>
                  {pending ? tCommon("saving") : tCommon("update")}
                </Button>
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() => submit("draft")}
                >
                  {tCommon("moveToDraft")}
                </Button>
              </>
            ) : (
              <>
                <Button disabled={pending} onClick={() => submit("published")}>
                  {pending ? tCommon("publishing") : tCommon("publish")}
                </Button>
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() => submit("draft")}
                >
                  {pending ? tCommon("saving") : tCommon("saveDraft")}
                </Button>
              </>
            )}
            <Button variant="ghost" asChild>
              <Link href="/dashboard/posts">{tCommon("cancel")}</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-slug">{tCommon("slug")}</Label>
          <Input
            id="post-slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            maxLength={75}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            required
            className="font-mono text-sm"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-meta">{tForm("metaDescription")}</Label>
          <Textarea
            id="post-meta"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={160}
            rows={3}
            placeholder={tForm("metaDescriptionPlaceholder")}
          />
          <p className="text-muted-foreground text-xs tabular-nums">
            {tForm("metaDescriptionHelper", { count: metaDescription.length })}
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="post-excerpt">{tForm("excerpt")}</Label>
          <Textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            maxLength={300}
            rows={4}
            placeholder={tForm("excerptPlaceholder")}
          />
          <p className="text-muted-foreground text-xs tabular-nums">
            {tForm("excerptHelper", { count: excerpt.length })}
          </p>
        </div>

        <div className="grid gap-2">
          <Label>{tForm("coverImage")}</Label>
          <MediaPicker
            options={media}
            value={coverMediaId}
            onChange={setCoverMediaId}
          />
        </div>

        <div className="grid gap-2">
          <Label>{tForm("category")}</Label>
          <CategoryCombobox
            options={categories}
            value={categoryId}
            onChange={setCategoryId}
          />
        </div>

        <div className="grid gap-2">
          <Label>{tForm("tags")}</Label>
          <TagMultiPicker
            options={tags}
            value={tagIds}
            onChange={setTagIds}
            max={8}
          />
        </div>
      </aside>
    </div>
  );
}
