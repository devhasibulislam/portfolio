import type { Metadata } from "next";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import Link from "next/link";
import { tag } from "@/lib/cache-tags";
import { getPublishedPostBySlug } from "@/lib/db/queries/public-posts";
import { coverOgUrl, renderTiptapToHtml } from "@/lib/tiptap-render";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

type Params = { slug: string };

async function loadPost(slug: string) {
  "use cache";
  cacheTag(tag.post(slug));
  return getPublishedPostBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) return { title: "Not found" };

  const url = `${SITE_URL}/blog/${post.slug}`;
  const og = coverOgUrl(post.coverPublicId);

  return {
    title: post.title,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.metaDescription,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: og ? [{ url: og, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription,
      images: og ? [og] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();

  const html = renderTiptapToHtml(post.body);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const og = coverOgUrl(post.coverPublicId);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: url,
    image: og ? [og] : undefined,
    author: { "@type": "Person", name: "Hasibul Islam" },
    publisher: { "@type": "Person", name: "Hasibul Islam" },
    articleSection: post.categoryName ?? undefined,
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <script
        type="application/ld+json"
        // Next 16 requires this to be inline for the crawler; safe because
        // the object is server-built from typed fields, no user HTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8 flex flex-col gap-3">
        {post.categoryName && post.categorySlug ? (
          <Link
            href={`/blog/category/${post.categorySlug}`}
            className="text-muted-foreground hover:text-primary text-xs uppercase tracking-wider"
          >
            {post.categoryName}
          </Link>
        ) : null}
        <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-muted-foreground text-base">{post.excerpt}</p>
        <time
          dateTime={post.publishedAt}
          className="text-muted-foreground text-sm"
        >
          {new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </header>

      {post.coverPublicId ? (
        <div className="bg-muted mb-10 overflow-hidden rounded-lg">
          {/* Cloudinary-transformed URL via `getCldImageUrl` — CldImage
              would require a client boundary because it uses hooks.
              next/image is redundant here: Cloudinary already delivers
              via `f_auto/q_auto` from its CDN. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getCldImageUrl({
              src: post.coverPublicId,
              width: 1200,
            })}
            width={post.coverWidth ?? 1200}
            height={post.coverHeight ?? 630}
            alt={post.title}
            className="h-auto w-full"
          />
        </div>
      ) : null}

      <article
        className="prose dark:prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {post.tags.length > 0 ? (
        <footer className="mt-12 flex flex-wrap items-center gap-2 border-t pt-6">
          <span className="text-muted-foreground text-sm">Tags:</span>
          {post.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog/tag/${t.slug}`}
              className="bg-muted hover:bg-primary/10 hover:text-primary rounded-md px-2 py-0.5 text-xs font-medium transition-colors"
            >
              {t.name}
            </Link>
          ))}
        </footer>
      ) : null}
    </main>
  );
}
