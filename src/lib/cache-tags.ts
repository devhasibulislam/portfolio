/**
 * Cache tags per PROJECT_CONTEXT §13. Every mutation server action calls
 * `revalidateTag(tag.<entity>())` — public routes read with the matching
 * `cacheTag()`. Keep this the single source of truth for tag strings.
 */
export const tag = {
  categories: () => "categories",
  tags: () => "tags",
  posts: () => "posts",
  post: (slug: string) => `post:${slug}`,
  media: () => "media",
  resumes: () => "resumes",
  activeResume: () => "resume:active",
};
